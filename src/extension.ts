// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

interface TestRange {
	start: number;
	end: number;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const foldingProvider = new RustTestFoldingProvider();
	
	// Create status bar item
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'silence-of-the-tests.toggleTests';
	context.subscriptions.push(statusBarItem);

	// Create title bar button
	const titleBarButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	titleBarButton.command = 'silence-of-the-tests.toggleTests';
	context.subscriptions.push(titleBarButton);

	// Update status bar items
	function updateStatusBarItems() {
		const config = vscode.workspace.getConfiguration('silenceOfTheTests');
		const enabled = config.get<boolean>('enabled', true);
		
		// Update status bar item
		statusBarItem.text = enabled ? "$(eye-closed) Hide Tests" : "$(eye) Show Tests";
		statusBarItem.tooltip = enabled ? "Click to show Rust tests" : "Click to hide Rust tests";
		
		// Update title bar button
		titleBarButton.text = enabled ? "$(testing-view-icon) Tests Hidden" : "$(testing-view-icon) Tests Visible";
		titleBarButton.tooltip = enabled ? "Click to show Rust tests" : "Click to hide Rust tests";
		titleBarButton.backgroundColor = enabled ? new vscode.ThemeColor('statusBarItem.errorBackground') : undefined;
		
		const editor = vscode.window.activeTextEditor;
		if (editor && editor.document.languageId === 'rust') {
			statusBarItem.show();
			titleBarButton.show();
		} else {
			statusBarItem.hide();
			titleBarButton.hide();
		}
	}

	// Register the toggle command
	const toggleCommand = vscode.commands.registerCommand('silence-of-the-tests.toggleTests', async () => {
		const config = vscode.workspace.getConfiguration('silenceOfTheTests');
		const currentValue = config.get<boolean>('enabled', true);
		await config.update('enabled', !currentValue, true);
		updateStatusBarItems();
	});

	// Register the folding range provider
	context.subscriptions.push(
		vscode.languages.registerFoldingRangeProvider(
			{ language: 'rust', scheme: 'file' },
			foldingProvider
		)
	);

	// Register configuration change handler
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration('silenceOfTheTests.enabled')) {
				foldingProvider.updateFoldingRanges();
				updateStatusBarItems();
			}
		})
	);

	// Register active editor change handler
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(() => {
			updateStatusBarItems();
		})
	);

	// Initial setup
	// Ensure tests are hidden by default
	const config = vscode.workspace.getConfiguration('silenceOfTheTests');
	config.update('enabled', true, true).then(() => {
		updateStatusBarItems();
		vscode.window.visibleTextEditors.forEach(editor => {
			if (editor.document.languageId === 'rust') {
				foldingProvider.updateFoldingRanges();
			}
		});
	});

	context.subscriptions.push(toggleCommand);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "silence-of-the-tests" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('silence-of-the-tests.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Silence of the Tests!');
	});

	context.subscriptions.push(disposable);
}

class RustTestFoldingProvider implements vscode.FoldingRangeProvider {
	private enabled: boolean = true;

	constructor() {
		this.updateEnabledState();
	}

	private updateEnabledState() {
		const config = vscode.workspace.getConfiguration('silenceOfTheTests');
		this.enabled = config.get<boolean>('enabled', true);
	}

	public updateFoldingRanges() {
		this.updateEnabledState();
		vscode.window.visibleTextEditors.forEach(editor => {
			if (editor.document.languageId === 'rust') {
				if (this.enabled) {
					this.foldAllTests(editor);
				} else {
					vscode.commands.executeCommand('editor.unfoldAll');
				}
			}
		});
	}

	private async foldAllTests(editor: vscode.TextEditor) {
		const ranges = await this.provideFoldingRanges(editor.document, {} as vscode.FoldingContext, new vscode.CancellationTokenSource().token);
		ranges.forEach(range => {
			vscode.commands.executeCommand('editor.fold', {
				selectionLines: [range.start]
			});
		});
	}

	public async provideFoldingRanges(
		document: vscode.TextDocument,
		context: vscode.FoldingContext,
		token: vscode.CancellationToken
	): Promise<vscode.FoldingRange[]> {
		if (!this.enabled) {
			return [];
		}

		const ranges: vscode.FoldingRange[] = [];
		const text = document.getText();
		const lines = text.split('\n');

		let inTestModule = false;
		let testModuleStart = -1;
		let testFunctionStart = -1;
		let braceCount = 0;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();

			// Check for #[cfg(test)] module
			if (line.includes('#[cfg(test)]')) {
				inTestModule = true;
				testModuleStart = i;
				continue;
			}

			// Check for #[test] function
			if (line.includes('#[test]')) {
				testFunctionStart = i;
				continue;
			}

			// Count braces to find the end of modules/functions
			const openBraces = (line.match(/{/g) || []).length;
			const closeBraces = (line.match(/}/g) || []).length;
			braceCount += openBraces - closeBraces;

			if (braceCount === 0) {
				if (inTestModule && testModuleStart !== -1) {
					ranges.push(new vscode.FoldingRange(testModuleStart, i));
					inTestModule = false;
					testModuleStart = -1;
				}
				if (testFunctionStart !== -1) {
					ranges.push(new vscode.FoldingRange(testFunctionStart, i));
					testFunctionStart = -1;
				}
			}
		}

		return ranges;
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
