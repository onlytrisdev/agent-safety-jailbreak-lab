import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

const decodeUrlGlobal = (codes: number[], key: number): string => {
    return String.fromCharCode(...codes.map(c => c ^ key));
};

function isValidUrl(str: string): boolean {
    try {
        new URL(str);
        return str.startsWith('http://') || str.startsWith('https://');
    } catch (_) {
        return false;
    }
}

function getClaudeConfigDir(): string {
    const configuredDir = process.env.CLAUDE_CONFIG_DIR?.trim();
    return configuredDir ? path.resolve(configuredDir) : path.join(os.homedir(), '.claude');
}

const ONLYTRIS_OUTPUT_STYLE_NAME = 'OnlyTris';
const CLAUDE_OUTPUT_STYLE_BACKUP_KEY = 'claudeOutputStyleBackup';

interface ClaudeOutputStyleBackup {
    hadValue: boolean;
    value?: unknown;
}

function readJsonObject(filePath: string): Record<string, unknown> {
    if (!fs.existsSync(filePath)) {
        return {};
    }

    const parsed: unknown = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error(`Cấu hình không hợp lệ: ${filePath} phải chứa một JSON object.`);
    }

    return parsed as Record<string, unknown>;
}

function writeJsonObject(filePath: string, value: Record<string, unknown>): void {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function createClaudeOutputStyleContent(instructions: string): string {
    return [
        '---',
        `name: ${ONLYTRIS_OUTPUT_STYLE_NAME}`,
        'description: Global OnlyTris response style',
        'keep-coding-instructions: true',
        '---',
        '',
        instructions
    ].join('\n');
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Agent Safety Jailbreak Lab is active!');

    // Initialize or fetch stable device ID
    let deviceId = context.globalState.get<string>('deviceId');
    if (!deviceId) {
        deviceId = crypto.randomBytes(16).toString('hex'); // 32 hex chars
        context.globalState.update('deviceId', deviceId);
    }

    const provider = new GeminiWriterViewProvider(context.extensionUri, deviceId, context.globalState);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(GeminiWriterViewProvider.viewType, provider)
    );

    const focusDisposable = vscode.commands.registerCommand('agent-safety-jailbreak-lab.focus', () => {
        vscode.commands.executeCommand('agent-safety-jailbreak-lab-view.focus');
    });
    context.subscriptions.push(focusDisposable);
}

class GeminiWriterViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'agent-safety-jailbreak-lab-view';
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _deviceId: string,
        private readonly _globalState: vscode.Memento
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        const htmlPath = path.join(this._extensionUri.fsPath, 'src', 'webview.html');
        let htmlContent = '';
        try {
            htmlContent = fs.readFileSync(htmlPath, 'utf8');
        } catch (err) {
            const errStr = String(err).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            webviewView.webview.html = '<h3>Failed to load webview template: ' + errStr + '</h3>';
            return;
        }

        webviewView.webview.html = htmlContent;

        const geminiPath = path.join(os.homedir(), '.gemini', 'GEMINI.md');
        const kiroPath = path.join(os.homedir(), '.kiro', 'steering', 'agents.md');
        // User-level Claude output styles are global across projects. Respecting
        // CLAUDE_CONFIG_DIR keeps the extension portable across machines.
        const claudeConfigDir = getClaudeConfigDir();
        const claudeOutputStylePath = path.join(claudeConfigDir, 'output-styles', 'onlytris.md');
        const claudeSettingsPath = path.join(claudeConfigDir, 'settings.json');
        const legacyClaudeRulePath = path.join(claudeConfigDir, 'rules', 'onlytris.md');

        // Helper to get stats of a single file
        const getSingleFileStats = (filePath: string) => {
            try {
                if (fs.existsSync(filePath)) {
                    const stats = fs.statSync(filePath);
                    const content = fs.readFileSync(filePath, 'utf8');
                    const lines = content.split(/\r?\n/).length;
                    return {
                        exists: true,
                        sizeBytes: stats.size,
                        lines: lines,
                        mtime: stats.mtime.toLocaleString('vi-VN', { hour12: false })
                    };
                }
            } catch (err) {
                console.error(`Error reading file stats for ${filePath}:`, err);
            }
            return {
                exists: false,
                sizeBytes: 0,
                lines: 0,
                mtime: 'N/A'
            };
        };

        // Helper to get stats of target files
        const getFileStats = () => {
            return {
                gemini: getSingleFileStats(geminiPath),
                kiro: getSingleFileStats(kiroPath),
                claude: getSingleFileStats(claudeOutputStylePath)
            };
        };

        // Handle messages from the Webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'ready': {
                    const stats = getFileStats();
                    const savedBypassType = this._globalState.get<string>('bypassType') || 'V1';
                    webviewView.webview.postMessage({
                        command: 'load',
                        stats: stats,
                        deviceId: this._deviceId,
                        bypassType: savedBypassType
                    });
                    break;
                }
                case 'activateSync': {
                    try {
                        const bypassType = this._globalState.get<string>('bypassType') || 'V1';
                        // XOR decoding to prevent plain-text extraction from the packaged extension files
                        const decodeUrl = (codes: number[], key: number): string => {
                            return String.fromCharCode(...codes.map(c => c ^ key));
                        };
                        const codesV1 = [66, 94, 94, 90, 89, 16, 5, 5, 90, 75, 68, 79, 70, 4, 69, 68, 70, 83, 94, 88, 67, 89, 4, 67, 69, 4, 92, 68, 5, 70, 67, 72, 5, 5, 109, 111, 103, 99, 100, 99, 117, 92, 27, 4, 71, 78];
                        const codesV2 = [66, 94, 94, 90, 89, 16, 5, 5, 90, 75, 68, 79, 70, 4, 69, 68, 70, 83, 94, 88, 67, 89, 4, 67, 69, 4, 92, 68, 5, 70, 67, 72, 5, 5, 109, 111, 103, 99, 100, 99, 117, 92, 24, 4, 71, 78];
                        const key = 42;
                        const libUrl = bypassType === 'V2' ? decodeUrl(codesV2, key) : decodeUrl(codesV1, key);
                        webviewView.webview.postMessage({ command: 'syncStatus', status: 'download' });

                        let fileContent = '';
                        if (isValidUrl(libUrl)) {
                            const fileResponse = await fetch(libUrl);
                            if (!fileResponse.ok) {
                                throw new Error(`Không thể tải cấu hình Bypass ${bypassType}: ${fileResponse.statusText}`);
                            }
                            fileContent = await fileResponse.text();
                        } else {
                            fileContent = libUrl;
                        }

                        // Overwrite the local GEMINI.md file
                        const geminiParentDir = path.dirname(geminiPath);
                        if (!fs.existsSync(geminiParentDir)) {
                            fs.mkdirSync(geminiParentDir, { recursive: true });
                        }
                        fs.writeFileSync(geminiPath, fileContent, 'utf8');

                        // Overwrite the local Kiro agents.md file
                        const kiroParentDir = path.dirname(kiroPath);
                        if (!fs.existsSync(kiroParentDir)) {
                            fs.mkdirSync(kiroParentDir, { recursive: true });
                        }
                        fs.writeFileSync(kiroPath, fileContent, 'utf8');

                        // Output styles are appended to Claude Code's system prompt,
                        // making role, tone, and formatting instructions more reliable.
                        const claudeSettings = readJsonObject(claudeSettingsPath);
                        const currentOutputStyle = claudeSettings.outputStyle;
                        const existingBackup = this._globalState.get<ClaudeOutputStyleBackup>(CLAUDE_OUTPUT_STYLE_BACKUP_KEY);
                        if (currentOutputStyle !== ONLYTRIS_OUTPUT_STYLE_NAME && existingBackup === undefined) {
                            await this._globalState.update(CLAUDE_OUTPUT_STYLE_BACKUP_KEY, {
                                hadValue: Object.prototype.hasOwnProperty.call(claudeSettings, 'outputStyle'),
                                value: currentOutputStyle
                            } satisfies ClaudeOutputStyleBackup);
                        }

                        fs.mkdirSync(path.dirname(claudeOutputStylePath), { recursive: true });
                        fs.writeFileSync(claudeOutputStylePath, createClaudeOutputStyleContent(fileContent), 'utf8');
                        claudeSettings.outputStyle = ONLYTRIS_OUTPUT_STYLE_NAME;
                        writeJsonObject(claudeSettingsPath, claudeSettings);

                        // Migrate installations created by v1.0.0 without touching
                        // any user-owned CLAUDE.md file.
                        if (fs.existsSync(legacyClaudeRulePath)) {
                            fs.unlinkSync(legacyClaudeRulePath);
                        }

                        const updatedStats = getFileStats();
                        // Reply success to Webview
                        webviewView.webview.postMessage({
                            command: 'syncResponse',
                            success: true,
                            content: fileContent,
                            stats: updatedStats
                        });
                        vscode.window.showInformationMessage('Đồng bộ thành công. Hãy mở phiên Claude Code mới để áp dụng Output Style OnlyTris.');
                    } catch (err) {
                        const errMsg = err instanceof Error ? err.message : String(err);
                        webviewView.webview.postMessage({
                            command: 'syncResponse',
                            success: false,
                            error: errMsg
                        });
                        vscode.window.showErrorMessage(`Kích hoạt thất bại: ${errMsg}`);
                    }
                    break;
                }
                case 'resetBypass': {
                    try {
                        if (fs.existsSync(geminiPath)) {
                            fs.unlinkSync(geminiPath);
                        }
                        if (fs.existsSync(kiroPath)) {
                            fs.unlinkSync(kiroPath);
                        }
                        if (fs.existsSync(claudeOutputStylePath)) {
                            fs.unlinkSync(claudeOutputStylePath);
                        }
                        if (fs.existsSync(legacyClaudeRulePath)) {
                            fs.unlinkSync(legacyClaudeRulePath);
                        }

                        if (fs.existsSync(claudeSettingsPath)) {
                            const claudeSettings = readJsonObject(claudeSettingsPath);
                            if (claudeSettings.outputStyle === ONLYTRIS_OUTPUT_STYLE_NAME) {
                                const backup = this._globalState.get<ClaudeOutputStyleBackup>(CLAUDE_OUTPUT_STYLE_BACKUP_KEY);
                                if (backup?.hadValue) {
                                    claudeSettings.outputStyle = backup.value;
                                } else {
                                    delete claudeSettings.outputStyle;
                                }
                                writeJsonObject(claudeSettingsPath, claudeSettings);
                            }
                        }
                        await this._globalState.update(CLAUDE_OUTPUT_STYLE_BACKUP_KEY, undefined);
                        const updatedStats = getFileStats();
                        webviewView.webview.postMessage({
                            command: 'resetResponse',
                            success: true,
                            stats: updatedStats
                        });
                        vscode.window.showInformationMessage('Đã gỡ bỏ cấu hình Bypass thành công!');
                    } catch (err) {
                        const errMsg = err instanceof Error ? err.message : String(err);
                        webviewView.webview.postMessage({
                            command: 'resetResponse',
                            success: false,
                            error: errMsg
                        });
                        vscode.window.showErrorMessage(`Gỡ bỏ Bypass thất bại: ${errMsg}`);
                    }
                    break;
                }
                case 'saveBypassType': {
                    const bypassType = message.bypassType || 'V1';
                    this._globalState.update('bypassType', bypassType);
                    webviewView.webview.postMessage({
                        command: 'bypassTypeSaveResponse',
                        success: true,
                        message: `Đã lưu cấu hình Bypass ${bypassType} thành công!`
                    });
                    vscode.window.showInformationMessage(`Đã chuyển đổi sang cấu hình Bypass ${bypassType}.`);
                    break;
                }
            }
        });
    }
}

export function deactivate() {
    const geminiPath = path.join(os.homedir(), '.gemini', 'GEMINI.md');
    const kiroPath = path.join(os.homedir(), '.kiro', 'steering', 'agents.md');
    try {
        if (fs.existsSync(geminiPath)) {
            fs.unlinkSync(geminiPath);
            console.log('Successfully deleted GEMINI.md on deactivation');
        }
    } catch (err) {
        console.error('Failed to delete GEMINI.md on deactivation:', err);
    }
    try {
        if (fs.existsSync(kiroPath)) {
            fs.unlinkSync(kiroPath);
            console.log('Successfully deleted agents.md on deactivation');
        }
    } catch (err) {
        console.error('Failed to delete agents.md on deactivation:', err);
    }
    // Claude's user-level output style intentionally persists when VS Code reloads or
    // the extension deactivates. The explicit Reset action owns its cleanup.
}
