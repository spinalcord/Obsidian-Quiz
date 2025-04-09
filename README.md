# Obsidian Enhanced Quiz Plugin

An interactive quiz plugin for Obsidian that allows you to create various types of quizzes directly in your notes. Test your knowledge with multiple choice, true/false, text input, fill-in-the-blank, and sorting quizzes.

![Obsidian Quiz Plugin Screenshot](https://raw.githubusercontent.com/yourusername/obsidian-quiz-plugin/main/screenshots/quiz-demo.png)

## Features

- **Multiple quiz types**:
  - Multiple Choice (MC)
  - True/False (TF)
  - Text Input
  - Fill-in-the-Blank (FB)
  - Sorting/Ordering

- **Interactive elements**:
  - Drag and drop for fill-in-the-blank and sorting questions
  - Instant feedback on answers
  - Reset options for retrying quizzes

- **Simple syntax** that integrates with Obsidian's markdown
- **Customizable styles** that adapt to your Obsidian theme
- **Multiple languages support** with default German UI (easily customizable)

## Installation

### From Obsidian Community Plugins

1. Open Obsidian and go to Settings
2. Navigate to Community Plugins and turn off Safe Mode (if enabled)
3. Click "Browse" and search for "Enhanced Quiz"
4. Click "Install" and then "Enable"

### Manual Installation

1. Download the latest release from the [releases page](https://github.com/yourusername/obsidian-quiz-plugin/releases)
2. Extract the ZIP file to your Obsidian plugins folder: `your-vault/.obsidian/plugins/`
3. Restart Obsidian
4. Go to Settings > Community Plugins and enable "Enhanced Quiz Plugin"

## Usage

Create quizzes in your notes by using the `quiz` code block:

### Multiple Choice Quiz

```
```quiz
-- Type mc
-- Question What is the capital of France?
-- A Paris
-- B London 
-- C Berlin
-- D Madrid
-- Answer A
```
```

### True/False Quiz

```
```quiz
-- Type tf
-- Question The Earth is flat.
-- Answer false
```
```

### Text Input Quiz

```
```quiz
-- Type text
-- Question What is the largest planet in our solar system?
-- Answer Jupiter
```
```

### Fill-in-the-Blank Quiz

```
```quiz
-- Type fillblank
-- Question The [blank] is the closest star to Earth.
-- Answer Sun
```
```

Multiple blanks:

```
```quiz
-- Type fb
-- Question [blank] is the capital of [blank].
-- Answer Paris, France
```
```

### Sorting Quiz

```
```quiz
-- Type sort
-- Question Sort these planets by size (largest to smallest):
-- A Jupiter
-- B Saturn
-- C Neptune
-- D Earth
-- Answer A, B, C, D
```
```

## Alternative Syntax

You can also use a simpler alternative syntax:

```
```quiz
-- Type mc
What is the capital of France?
-- A Paris
-- B London 
-- C Berlin
-- D Madrid
-- Answer A
```
```

## Quiz Options Reference

| Option | Description |
|--------|-------------|
| `-- Type` | Quiz type: `mc` (multiple choice), `text`, `tf`/`truefalse`, `fb`/`fillblank`, `sort` |
| `-- Question` | The quiz question text |
| `-- A`, `-- B`, etc. | Answer options for multiple choice and sorting quizzes |
| `-- Answer` | The correct answer(s), comma-separated for multiple answers |

## Customization

### Changing Button Text and Messages

Edit the plugin code to change the default language from German to your preferred language:

1. Find all occurrences of UI strings like `'Überprüfen'`, `'Richtig!'`, `'Falsch'`, etc.
2. Replace them with your preferred language strings

### Styling

The plugin uses Obsidian's CSS variables for styling, ensuring it matches your theme. For advanced customization, you can add CSS snippets to your Obsidian vault.

## Troubleshooting

### Multiple Quizzes Interaction

If you have multiple fill-in-the-blank quizzes on one page and notice elements from one quiz appearing in another, make sure you're using the latest version of the plugin which fixes this issue by using unique identifiers for each quiz instance.

### Quiz Not Rendering

If your quiz doesn't render properly:

1. Check your syntax for errors
2. Ensure you've properly closed all code blocks
3. Verify that the plugin is enabled in your settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Obsidian team for their amazing platform
- All contributors who help improve this plugin