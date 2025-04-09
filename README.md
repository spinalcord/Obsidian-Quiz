# Obsidian Quiz Plugin

An interactive quiz plugin for [Obsidian](https://obsidian.md) that allows you to create and take quizzes directly within your notes.



## Features

- Create multiple-choice quizzes within your Obsidian notes
- Support for single and multiple correct answers
- Immediate feedback on quiz attempts
- Customizable styling that adapts to your Obsidian theme
- Simple syntax for creating quizzes

## Installation

### Manual Installation

1. Download the latest release from the [Releases](https://github.com/username/obsidian-quiz-plugin/releases) section
2. Extract the downloaded ZIP to your Obsidian plugins folder:
   - Windows: `%APPDATA%\Obsidian\plugins\`
   - macOS: `~/Library/Application Support/obsidian/plugins/`
   - Linux: `~/.config/obsidian/plugins/`
3. Restart Obsidian
4. Enable the plugin in Settings → Community plugins

## Usage

### Creating a Quiz

To create a quiz, use a code block with the `quiz` language identifier:


```quiz
-- A
This is option A
-- B
This is option B
-- C
This is option C
-- Answer A,C
```


### Quiz Syntax

The quiz syntax is straightforward:

- Each quiz is enclosed in a code block with the `quiz` language
- Options start with `-- ` followed by an ID (e.g., `A`, `B`, `C`)
- Option text follows on the same line or subsequent lines
- Correct answers are specified with `-- Answer` followed by the IDs of correct options

### Examples

#### Single Correct Answer


```quiz
-- A
Paris is the capital of France
-- B
London is the capital of France
-- Answer A
```


#### Multiple Correct Answers


```quiz
-- A
JavaScript is a programming language
-- B
Python is a programming language
-- C
HTML is a programming language
-- Answer A,B
```


#### Alternative Answer Format

The plugin also supports placing the answer on the next line:


```quiz
-- A
Option A
-- B
Option B
-- Answer
A
```


## Styling

The plugin adapts to your Obsidian theme, but you can customize it further by adding CSS snippets in Obsidian.