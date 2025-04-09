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

## Usage

Create quizzes in your notes by using the `quiz` code block:

### Multiple Choice Quiz

\`\`\`quiz
-- Type mc
-- Question What is the capital of France?
-- A Paris
-- B London 
-- C Berlin
-- D Madrid
-- Answer A
\`\`\`

### True/False Quiz

\`\`\`quiz
-- Type tf
-- Question The Earth is flat.
-- Answer false
\`\`\`

### Text Input Quiz

\`\`\`quiz
-- Type text
-- Question What is the largest planet in our solar system?
-- Answer Jupiter
\`\`\`

### Fill-in-the-Blank Quiz

\`\`\`quiz
-- Type fillblank
-- Question The [blank] is the closest star to Earth.
-- Answer Sun
\`\`\`

Multiple blanks:

\`\`\`quiz
-- Type fb
-- Question [blank] is the capital of [blank].
-- Answer Paris, France
\`\`\`

### Sorting Quiz

\`\`\`quiz
-- Type sort
-- Question Sort these planets by size (largest to smallest):
-- A Jupiter
-- B Saturn
-- C Neptune
-- D Earth
-- Answer A, B, C, D
\`\`\`

## Alternative Syntax

You can also use a simpler alternative syntax:

\`\`\`quiz
-- Type mc
What is the capital of France?
-- A Paris
-- B London 
-- C Berlin
-- D Madrid
-- Answer A
\`\`\`
