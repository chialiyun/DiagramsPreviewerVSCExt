// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "helloworld" is now active!');
	console.log(context.extensionPath);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const command = 'diagramasacodepreview.start';

	const getDiagramSource = () => vscode.window.activeTextEditor?.document.uri.path ?? "";

	const fileName = vscode.window.activeTextEditor?.document?.fileName;
	console.log(fileName);
	console.log(getDiagramSource());
	const full_path = getDiagramSource();

	const target_file = path.join(context.extensionPath, "media", "out", `test.png`);
	const withDiagramFilePath = path.join(context.extensionPath, "media", "out", `test`);
	const target_src_file = path.join(context.extensionPath, "media", "out", `test.py`);

	const getContent = () => {
		var data = fs.readFileSync(target_file).toString('base64');

		const content = `<!DOCTYPE html>
			<html>
			  <body>
				<img src="data:image/png;base64, ${data}">
			  </body>
			</html>`;

		return content;
	}

	const generateDiagram = async (panel: vscode.WebviewPanel) => {
		const proc = require('child_process');
		const cmd = `python3 ${target_src_file}`;
		console.log(cmd);

		// execute command
		proc.exec(cmd, (err: string, stdout: string, stderr: string) => {
			if (err) {
				console.log('error: ' + err);
				return;
			}
			panel.webview.html = getContent();
		});
	}

	const updateTempSourceFile = (panel: vscode.WebviewPanel) => {
		const editor = vscode.window.activeTextEditor;

		let line = 0, wordLine, textRange, wholeText, finalSrc = '';
		const lineCount = editor?.document.lineCount;

		// find the with Diagram line
		do {
			wordLine = editor?.document.lineAt(line)
			textRange = new vscode.Range(wordLine?.range?.start!, wordLine?.range?.end!);
			wholeText = editor?.document.getText(textRange)

			line++;
			
			if (!wholeText?.includes("with Diagram"))
				finalSrc = `${finalSrc}${wholeText}\n`;
		} while(!wholeText?.includes("with Diagram"));

		// Get `withDiagram args`
		const opening = wholeText.indexOf('(');
		const closing = wholeText.indexOf(')');
		const args = wholeText.substring(opening+1, closing).split(",");

		// Form `withDiagram` line
		let withDiagram = 'with Diagram(';
		args.forEach(x => {
			if (!x.includes('fileName')) 
				withDiagram = `${withDiagram}${x},`
		});
		withDiagram = `${withDiagram}filename="${withDiagramFilePath}",`

		withDiagram = `${withDiagram}):\n`

		// Add `withDiagram` line
		finalSrc = `${finalSrc}${withDiagram}`;

		var pos1 = new vscode.Position(line, 0);
		var pos2 = new vscode.Position(lineCount!, 0);
		wholeText = editor?.document.getText(new vscode.Range(pos1, pos2));

		// Add the rest of the code
		finalSrc = `${finalSrc}${wholeText}`;

		// write to file
		fs.writeFile(target_src_file, finalSrc, err => {
			if (err)
				console.log(err);
			else
				generateDiagram(panel);
		});	
	}

	const commandHandler = () => {
		vscode.window.showInformationMessage('Hello World from HelloWorld!');

		// TODO: check if python is installed, check if the graphviz is installed

		const panel = vscode.window.createWebviewPanel(
			'diagramsPreview', 'Diagrams Preview',
			vscode.ViewColumn.Two,
			{
				localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media', 'out'))],
				enableScripts: true
			}
		);

		vscode.workspace.onDidSaveTextDocument((e) => {
			console.log("New changes saved, lets reload!");

			updateTempSourceFile(panel);
		});

		updateTempSourceFile(panel);
	}

	context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}

// this method is called when your extension is deactivated
export function deactivate() {}
