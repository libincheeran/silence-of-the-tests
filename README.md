# Silence of the Tests

A VSCode extension that automatically hides Rust unit tests when they're in the same module as business logic code. This helps you focus on your implementation code while keeping tests easily accessible.

## Features

- Automatically hides Rust test modules marked with `#[cfg(test)]`
- Hides test functions marked with `#[test]`
- Can be toggled on/off through VSCode settings
- Enabled by default

## Usage

1. Install the extension
2. Open any Rust file containing tests
3. The tests will be automatically folded
4. To view tests, simply click the fold indicator (▶) next to the test module or function
5. To disable the extension, go to Settings and uncheck "Silence of the Tests: Enabled"

## Configuration

The extension can be configured through VSCode settings:

- `silenceOfTheTests.enabled`: Enable/disable the extension (default: true)

## Example

```rust
// Business logic
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

// Hidden test module
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(2, 2), 4);
    }
}
```

## Requirements

- VSCode 1.85.0 or higher
- Rust language support

## Extension Settings

This extension contributes the following settings:

* `silenceOfTheTests.enabled`: Enable/disable hiding of Rust unit tests

## Known Issues

None at the moment.

## Release Notes

### 0.0.1

Initial release of Silence of the Tests

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
