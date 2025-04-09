import { Plugin } from 'obsidian';

interface QuizOption {
    id: string;
    text: string;
}

interface QuizQuestion {
    type: string;          // 'mc', 'text', 'truefalse', 'tf', 'fillblank', 'fb', 'sort'
    question: string;      // The question text
    options: QuizOption[]; // Options for MC and sorting questions
    answers: string[];     // Correct answers
    blanks?: number;       // Number of blanks for fillblank type
}

export default class QuizPlugin extends Plugin {
    async onload() {
        console.log('Loading Enhanced Quiz Plugin');
        
        // Register the quiz code block processor
        this.registerMarkdownCodeBlockProcessor('quiz', (source, el) => {
            try {
                // Parse the quiz content
                const quiz = this.parseQuizContent(source);
                
                // Create a container for the quiz
                const quizContainer = el.createDiv({ cls: 'quiz-container' });
                
                // Add question text if available
                if (quiz.question) {
                    const questionEl = quizContainer.createDiv({ cls: 'quiz-question' });
                    questionEl.setText(quiz.question);
                }
                
                // Create the quiz elements based on type
                this.renderQuiz(quizContainer, quiz);
                
            } catch (error) {
                console.error('Error rendering quiz:', error);
                
                // Display error message
                const errorDiv = el.createDiv({ cls: 'quiz-error' });
                errorDiv.setText(`Error rendering quiz: ${error.message}`);
                errorDiv.style.color = 'red';
                errorDiv.style.padding = '10px';
                errorDiv.style.border = '1px solid red';
                errorDiv.style.borderRadius = '4px';
                errorDiv.style.marginTop = '10px';
            }
        });

        // Add custom CSS
        this.addStyle();
    }

    onunload() {
        console.log('Unloading Enhanced Quiz Plugin');
        
        // Remove the custom style element
        const styleEl = document.getElementById('quiz-plugin-styles');
        if (styleEl) {
            styleEl.remove();
        }
    }

    parseQuizContent(source: string): QuizQuestion {
        if (!source || source.trim() === '') {
            throw new Error('Quiz content cannot be empty');
        }
        
        const lines = source.split('\n');
        const quiz: QuizQuestion = {
            type: 'mc',        // Default type is multiple choice
            question: '',
            options: [],
            answers: []
        };

        let currentOption: QuizOption | null = null;
        let processingAnswer = false;
        let processingQuestion = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines
            if (line === '') continue;
            
            // Check for type definition
            if (line.startsWith('-- Type ')) {
                const typeValue = line.substring('-- Type '.length).trim().toLowerCase();
                if (typeValue) {
                    quiz.type = typeValue;
                    processingQuestion = false;
                    processingAnswer = false;
                    currentOption = null;
                }
                continue;
            }
            
            // Check for question line
            if (line.startsWith('-- Question')) {
                processingQuestion = true;
                processingAnswer = false;
                currentOption = null;
                
                // Check if question is on the same line
                const questionText = line.substring('-- Question'.length).trim();
                if (questionText) {
                    quiz.question = questionText;
                    processingQuestion = false;
                }
                continue;
            }
            
            // Process question text if we're in question mode
            if (processingQuestion) {
                if (line.startsWith('-- ')) {
                    processingQuestion = false;
                } else {
                    if (quiz.question) {
                        quiz.question += '\n' + line;
                    } else {
                        quiz.question = line;
                    }
                    continue;
                }
            }
            
            // Check for option lines that start with "--"
            if (line.startsWith('-- ')) {
                // Check if this is an answer line
                if (line.toLowerCase().startsWith('-- answer')) {
                    // Extract answers
                    const answersText = line.substring('-- Answer'.length).trim();
                    
                    // If the answer is on the same line
                    if (answersText) {
                        // For fillblank type, we need to handle potential commas in answers
                        if (quiz.type === 'fillblank' || quiz.type === 'fb') {
                            // Count blanks in the question
                            const blankCount = (quiz.question.match(/\[blank\]/g) || []).length;
                            quiz.blanks = blankCount || 1; // Ensure at least one blank
                            
                            // If there's only one blank, treat the whole answersText as one answer
                            if (blankCount <= 1) {
                                quiz.answers = [answersText];
                            } else {
                                // Split by comma for multiple blanks
                                quiz.answers = answersText.split(',').map(a => a.trim());
                            }
                        } else if (quiz.type === 'truefalse' || quiz.type === 'tf') {
                            // Ensure the answer is properly formatted for true/false questions
                            const answer = answersText.toLowerCase().trim();
                            if (answer === 'true' || answer === 'false') {
                                quiz.answers = [answer];
                            } else {
                                quiz.answers = [answer === 'wahr' ? 'true' : 'false']; // Handle German
                            }
                        } else {
                            quiz.answers = answersText.split(',').map(a => a.trim());
                        }
                    } else {
                        // If answer is on the next line, set flag to process it
                        processingAnswer = true;
                    }
                    currentOption = null;
                } else {
                    // Regular option
                    const optionId = line.substring(3).trim();
                    
                    // Create new option
                    currentOption = {
                        id: optionId,
                        text: ''
                    };
                    
                    quiz.options.push(currentOption);
                    processingAnswer = false;
                }
                continue;
            } 
            
            // Process answer if we're in answer mode
            if (processingAnswer) {
                // For fillblank type, handle potential commas in answers
                if (quiz.type === 'fillblank' || quiz.type === 'fb') {
                    // Count blanks in the question
                    const blankCount = (quiz.question.match(/\[blank\]/g) || []).length;
                    quiz.blanks = blankCount || 1; // Ensure at least one blank
                    
                    // If there's only one blank, treat the whole line as one answer
                    if (blankCount <= 1) {
                        quiz.answers = [line];
                    } else {
                        // Split by comma for multiple blanks
                        quiz.answers = line.split(',').map(a => a.trim());
                    }
                } else if (quiz.type === 'truefalse' || quiz.type === 'tf') {
                    // Ensure the answer is properly formatted for true/false questions
                    const answer = line.toLowerCase().trim();
                    if (answer === 'true' || answer === 'false') {
                        quiz.answers = [answer];
                    } else {
                        quiz.answers = [answer === 'wahr' ? 'true' : 'false']; // Handle German
                    }
                } else {
                    quiz.answers = line.split(',').map(a => a.trim());
                }
                processingAnswer = false;
                continue;
            }
            
            // If we have a current option, add text to the option
            if (currentOption) {
                if (currentOption.text) {
                    currentOption.text += '\n' + line;
                } else {
                    currentOption.text = line;
                }
                continue;
            }
            
            // If no option is being processed and the line doesn't start with '--',
            // it might be part of an alternative syntax where the first option is the question
            if (quiz.options.length === 0 && quiz.question === '' && !line.startsWith('--')) {
                quiz.question = line;
            }
        }

        // For alternative syntax without explicit type but with A, B, C options,
        // default to multiple choice
        if (quiz.type === 'mc' && quiz.options.length > 0 && quiz.question === '') {
            // The first option might be the question in alternative syntax
            if (quiz.options[0]) {
                quiz.question = quiz.options[0].text;
                quiz.options.shift(); // Remove the first option which is actually the question
            }
        }
        
        // For true/false questions with alternative syntax
        if ((quiz.type === 'truefalse' || quiz.type === 'tf') && quiz.options.length === 1) {
            quiz.question = quiz.options[0].text;
            quiz.options = [];
        }
        
        // For text input with alternative syntax
        if (quiz.type === 'text' && quiz.options.length === 1) {
            quiz.question = quiz.options[0].text;
            quiz.options = [];
        }
        
        // Validation: ensure there's a question
        if (!quiz.question) {
            throw new Error('Quiz must have a question');
        }
        
        // Validation: ensure there are answers
        if (quiz.answers.length === 0) {
            throw new Error('Quiz must have at least one answer');
        }
        
        // Validation: ensure multiple choice questions have options
        if (quiz.type === 'mc' && quiz.options.length === 0) {
            throw new Error('Multiple choice questions must have options');
        }
        
        // Validation: ensure sorting questions have options and answers
        if (quiz.type === 'sort' && (quiz.options.length === 0 || quiz.answers.length === 0)) {
            throw new Error('Sorting questions must have options and a correct order');
        }
        
        return quiz;
    }

    renderQuiz(container: HTMLElement, quiz: QuizQuestion): void {
        const quizEl = container.createDiv({ cls: 'quiz-form' });
        
        // For fillblank type, we don't want to display the question text twice
        // since the question with blanks will be shown in the renderFillBlank method
        if (quiz.type.toLowerCase() === 'fillblank' || quiz.type.toLowerCase() === 'fb') {
            // Remove the question element that was created earlier
            const questionEl = container.querySelector('.quiz-question');
            if (questionEl) {
                container.removeChild(questionEl);
            }
        }
        
        // Render different quiz types
        switch (quiz.type.toLowerCase()) {
            case 'mc':
                this.renderMultipleChoice(quizEl, quiz);
                break;
            case 'text':
                this.renderTextInput(quizEl, quiz);
                break;
            case 'truefalse':
            case 'tf':
                this.renderTrueFalse(quizEl, quiz);
                break;
            case 'fillblank':
            case 'fb':
                this.renderFillBlank(quizEl, quiz);
                break;
            case 'sort':
                this.renderSorting(quizEl, quiz);
                break;
            default:
                // Default to multiple choice
                this.renderMultipleChoice(quizEl, quiz);
        }
        
        // No need to create result element here as it's created in each render method
    }

    renderMultipleChoice(quizEl: HTMLElement, quiz: QuizQuestion): void {
        // Create options
        quiz.options.forEach(option => {
            const optionContainer = quizEl.createDiv({ cls: 'quiz-option' });
            
            // Create checkbox
            optionContainer.createEl('input', { 
                type: 'checkbox',
                attr: {
                    id: `quiz-option-${option.id}`,
                    'data-option-id': option.id
                }
            });
            
            // Create label
            optionContainer.createEl('label', { 
                text: `${option.id}: ${option.text}`,
                attr: {
                    for: `quiz-option-${option.id}`
                }
            });
        });
        
        // Create submit button
        const submitBtn = quizEl.createEl('button', {
            text: 'Überprüfen',
            cls: 'quiz-submit-btn',
            type: 'button'
        });
        
        // Create result element
        const resultEl = quizEl.createDiv({ cls: 'quiz-result' });
        
        // Add event listener for submit button
        submitBtn.addEventListener('click', (e) => {
            // Prevent default button behavior
            e.preventDefault();
            
            // Get selected options
            const selectedOptions: string[] = [];
            
            quizEl.querySelectorAll('input[type="checkbox"]:checked').forEach((checkbox) => {
                const optionId = (checkbox as HTMLInputElement).getAttribute('data-option-id');
                if (optionId) {
                    selectedOptions.push(optionId);
                }
            });
            
            // Check if answers match
            const isCorrect = this.checkAnswers(selectedOptions, quiz.answers);
            
            // Update result message
            resultEl.empty();
            
            if (isCorrect) {
                resultEl.setText('Richtig! 🎉');
                resultEl.addClass('quiz-correct');
                resultEl.removeClass('quiz-incorrect');
            } else {
                resultEl.setText(`Falsch. Die richtige Antwort ist: ${quiz.answers.join(', ')}`);
                resultEl.addClass('quiz-incorrect');
                resultEl.removeClass('quiz-correct');
            }
        });
    }

    renderTextInput(quizEl: HTMLElement, quiz: QuizQuestion): void {
        // Create input field
        const inputContainer = quizEl.createDiv({ cls: 'quiz-text-input' });
        
        const input = inputContainer.createEl('input', {
            type: 'text',
            cls: 'quiz-text-field',
            attr: {
                placeholder: 'Deine Antwort...'
            }
        });
        
        // Create submit button
        const submitBtn = quizEl.createEl('button', {
            text: 'Überprüfen',
            cls: 'quiz-submit-btn',
            type: 'button'
        });
        
        // Create result element
        const resultEl = quizEl.createDiv({ cls: 'quiz-result' });
        
        // Add event listener for submit button
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const userAnswer = input.value.trim();
            
            // Check if the user's answer matches any of the correct answers (case insensitive)
            const isCorrect = quiz.answers.some(answer => 
                userAnswer.toLowerCase() === answer.toLowerCase()
            );
            
            // Update result message
            resultEl.empty();
            
            if (isCorrect) {
                resultEl.setText('Richtig! 🎉');
                resultEl.addClass('quiz-correct');
                resultEl.removeClass('quiz-incorrect');
            } else {
                resultEl.setText(`Falsch. Die richtige Antwort ist: ${quiz.answers.join(' oder ')}`);
                resultEl.addClass('quiz-incorrect');
                resultEl.removeClass('quiz-correct');
            }
        });
    }

    renderTrueFalse(quizEl: HTMLElement, quiz: QuizQuestion): void {
        const optionsContainer = quizEl.createDiv({ cls: 'quiz-tf-options' });
        
        // Create true option
        const trueContainer = optionsContainer.createDiv({ cls: 'quiz-option' });
        trueContainer.createEl('input', {
            type: 'radio',
            attr: {
                id: 'quiz-option-true',
                name: 'tf-answer',
                value: 'true'
            }
        });
        trueContainer.createEl('label', {
            text: 'Wahr',
            attr: {
                for: 'quiz-option-true'
            }
        });
        
        // Create false option
        const falseContainer = optionsContainer.createDiv({ cls: 'quiz-option' });
        falseContainer.createEl('input', {
            type: 'radio',
            attr: {
                id: 'quiz-option-false',
                name: 'tf-answer',
                value: 'false'
            }
        });
        falseContainer.createEl('label', {
            text: 'Falsch',
            attr: {
                for: 'quiz-option-false'
            }
        });
        
        // Create submit button
        const submitBtn = quizEl.createEl('button', {
            text: 'Überprüfen',
            cls: 'quiz-submit-btn',
            type: 'button'
        });
        
        // Create result element
        const resultEl = quizEl.createDiv({ cls: 'quiz-result' });
        
        // Add event listener for submit button
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const selectedValue = quizEl.querySelector('input[name="tf-answer"]:checked') as HTMLInputElement;
            
            if (!selectedValue) {
                resultEl.setText('Bitte wähle eine Antwort aus.');
                resultEl.removeClass('quiz-correct quiz-incorrect');
                return;
            }
            
            // The expected answer format is 'true' or 'false' as a string
            const userAnswer = selectedValue.value;
            const correctAnswer = quiz.answers[0].toLowerCase();
            const isCorrect = userAnswer === correctAnswer;
            
            // Update result message
            resultEl.empty();
            
            if (isCorrect) {
                resultEl.setText('Richtig! 🎉');
                resultEl.addClass('quiz-correct');
                resultEl.removeClass('quiz-incorrect');
            } else {
                resultEl.setText(`Falsch. Die richtige Antwort ist: ${correctAnswer === 'true' ? 'Wahr' : 'Falsch'}`);
                resultEl.addClass('quiz-incorrect');
                resultEl.removeClass('quiz-correct');
            }
        });
    }

    // Aktualisierung für die renderFillBlank-Methode, die eindeutige IDs für jedes Quiz verwendet

renderFillBlank(quizEl: HTMLElement, quiz: QuizQuestion): void {
    // Generiere ein eindeutiges Präfix für dieses Quiz
    const quizId = `quiz_${Math.random().toString(36).substring(2, 10)}`;
    
    // Parse the question to identify blanks
    const blankRegex = /\[blank\]/g;
    const blanks = quiz.question.match(blankRegex) || [];
    const blankCount = blanks.length;
    
    // Create a container for blanks
    const mainContainer = quizEl.createDiv({ cls: 'quiz-fill-blank-main' });
    // Speichere das Quiz-ID als data-Attribut
    mainContainer.setAttribute('data-quiz-id', quizId);
    
    // Create a container for the text with blanks
    const blanksContainer = mainContainer.createDiv({ cls: 'quiz-blanks-container' });
    
    // Split the question text by [blank] placeholders
    const questionParts = quiz.question.split(blankRegex);
    
    // Create the question with drop zones
    for (let i = 0; i < questionParts.length; i++) {
        // Add the text part
        blanksContainer.createSpan({ text: questionParts[i] });
        
        // Add a drop zone after each part except the last one
        if (i < questionParts.length - 1) {
            const dropZone = blanksContainer.createDiv({ 
                cls: 'quiz-blank-dropzone',
                attr: {
                    'data-blank-index': i.toString(),
                    'data-quiz-id': quizId
                }
            });
            
            // Create placeholder text
            const placeholder = dropZone.createSpan({ 
                cls: 'quiz-blank-placeholder',
                text: '...' 
            });
            
            // Add drag and drop events
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            });
            
            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('dragover');
            });
            
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                
                // Get the dragged element's data - jetzt mit Quiz-ID und Option-ID
                const transferData = e.dataTransfer?.getData('text/plain');
                if (!transferData) return;
                
                try {
                    const [dragQuizId, optionId] = transferData.split('|');
                    
                    // Prüfe, ob das Element zum selben Quiz gehört
                    if (dragQuizId !== quizId) {
                        console.warn('Versuchte, ein Element von einem anderen Quiz zu ziehen');
                        return;
                    }
                    
                    // Find the dragged option element mit dem eindeutigen Präfix
                    const optionSelector = `#${quizId}_option_${optionId}`;
                    const optionEl = document.querySelector(optionSelector);
                    if (!optionEl) return;
                    
                    // Clear previous content
                    const existingOption = dropZone.querySelector('.quiz-blank-option');
                    if (existingOption) {
                        // Remove the existing option
                        dropZone.removeChild(existingOption);
                        
                        // Make the original option draggable again
                        const originalId = existingOption.getAttribute('data-original-id');
                        if (originalId) {
                            const originalOption = document.querySelector(`#${quizId}_option_${originalId}`);
                            if (originalOption) {
                                originalOption.classList.remove('used');
                            }
                        }
                    }
                    
                    // Hide placeholder
                    placeholder.style.display = 'none';
                    
                    // Create a clone of the dragged item
                    const clone = document.createElement('div');
                    clone.className = 'quiz-blank-option in-dropzone';
                    clone.textContent = optionEl.textContent || '';
                    clone.setAttribute('data-option-id', optionId);
                    clone.setAttribute('data-original-id', optionId); // Store the original ID for reference
                    clone.setAttribute('data-quiz-id', quizId); // Store the quiz ID for reference
                    
                    // Enable removing the option by clicking on it
                    clone.addEventListener('click', () => {
                        dropZone.removeChild(clone);
                        placeholder.style.display = '';
                        
                        // Make the original option draggable again with dem eindeutigen Präfix
                        const originalOption = document.querySelector(`#${quizId}_option_${optionId}`);
                        if (originalOption) {
                            originalOption.classList.remove('used');
                        }
                    });
                    
                    dropZone.appendChild(clone);
                    
                    // Mark the original option as used
                    optionEl.classList.add('used');
                } catch (err) {
                    console.error('Fehler beim Verarbeiten des gezogenen Elements:', err);
                }
            });
        }
    }
    
    // Create options container
    const optionsContainer = mainContainer.createDiv({ cls: 'quiz-blank-options-container' });
    optionsContainer.createDiv({ cls: 'quiz-blank-options-title', text: 'Verfügbare Optionen:' });
    
    // Create available options (use the answers as draggable options)
    const optionsList = optionsContainer.createDiv({ 
        cls: 'quiz-blank-options',
        attr: { 'data-quiz-id': quizId }
    });
    
    // Use answers as options, but shuffle them
    const optionsToUse = [...quiz.answers];
    this.shuffleArray(optionsToUse);
    
    optionsToUse.forEach((answer, index) => {
        // Verwende eindeutige ID mit dem Quiz-Präfix
        const optionId = `${quizId}_option_${index}`;
        
        const option = optionsList.createDiv({ 
            cls: 'quiz-blank-option',
            text: answer,
            attr: {
                draggable: 'true',
                id: optionId,
                'data-index': index.toString(),
                'data-quiz-id': quizId
            }
        });
        
        // Add drag events
        option.addEventListener('dragstart', (e) => {
            if (option.classList.contains('used')) {
                e.preventDefault();
                return;
            }
            
            option.classList.add('dragging');
            
            if (e.dataTransfer) {
                // Übertrage sowohl Quiz-ID als auch Option-Index
                e.dataTransfer.setData('text/plain', `${quizId}|${index}`);
                e.dataTransfer.effectAllowed = 'move';
            }
        });
        
        option.addEventListener('dragend', () => {
            option.classList.remove('dragging');
        });
    });
    
    // Create reset button to clear all dropzones
    const resetBtn = mainContainer.createEl('button', {
        text: 'Zurücksetzen',
        cls: 'quiz-reset-btn',
        type: 'button'
    });
    
    resetBtn.addEventListener('click', () => {
        // Clear all dropzones - jetzt nur für dieses spezifische Quiz
        const dropZones = mainContainer.querySelectorAll('.quiz-blank-dropzone[data-quiz-id="' + quizId + '"]');
        dropZones.forEach(zone => {
            const options = zone.querySelectorAll('.quiz-blank-option');
            options.forEach(opt => zone.removeChild(opt));
            
            const placeholder = zone.querySelector('.quiz-blank-placeholder');
            if (placeholder) {
                (placeholder as HTMLElement).style.display = '';
            }
        });
        
        // Reset all options - jetzt nur für dieses spezifische Quiz
        const options = mainContainer.querySelectorAll(`.quiz-blank-options[data-quiz-id="${quizId}"] .quiz-blank-option`);
        options.forEach(option => {
            option.classList.remove('used');
        });
        
        // Clear result
        resultEl.empty();
        resultEl.removeClass('quiz-correct quiz-incorrect');
    });
    
    // Create submit button
    const submitBtn = mainContainer.createEl('button', {
        text: 'Überprüfen',
        cls: 'quiz-submit-btn',
        type: 'button'
    });
    
    // Create result element
    const resultEl = mainContainer.createDiv({ cls: 'quiz-result' });
    
    // Add event listener for submit button
    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Get all filled dropzones - jetzt nur für dieses spezifische Quiz
        const dropZones = mainContainer.querySelectorAll('.quiz-blank-dropzone[data-quiz-id="' + quizId + '"]');
        const userAnswers: string[] = [];
        
        dropZones.forEach(zone => {
            const option = zone.querySelector('.quiz-blank-option');
            if (option) {
                userAnswers.push(option.textContent || '');
            } else {
                userAnswers.push('');
            }
        });
        
        // Make sure all dropzones have been filled
        if (userAnswers.some(a => a === '')) {
            resultEl.setText('Bitte fülle alle Lücken aus.');
            resultEl.removeClass('quiz-correct quiz-incorrect');
            return;
        }
        
        // Make sure we have enough answers
        if (quiz.answers.length < blankCount) {
            resultEl.setText('Error: Not enough correct answers defined for all blanks.');
            resultEl.removeClass('quiz-correct quiz-incorrect');
            return;
        }
        
        // Compare user answers with correct answers
        let allCorrect = true;
        for (let i = 0; i < blankCount; i++) {
            const userAnswer = userAnswers[i].toLowerCase();
            const correctAnswer = quiz.answers[i].toLowerCase();
            
            if (userAnswer !== correctAnswer) {
                allCorrect = false;
                break;
            }
        }
        
        // Update result message
        resultEl.empty();
        
        if (allCorrect) {
            resultEl.setText('Richtig! 🎉');
            resultEl.addClass('quiz-correct');
            resultEl.removeClass('quiz-incorrect');
        } else {
            resultEl.setText(`Falsch. Die richtigen Antworten sind: ${quiz.answers.join(', ')}`);
            resultEl.addClass('quiz-incorrect');
            resultEl.removeClass('quiz-correct');
        }
    });
}

    // Helper method to shuffle an array
    shuffleArray<T>(array: T[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    renderSorting(quizEl: HTMLElement, quiz: QuizQuestion): void {
        // Create a container for sortable items
        const sortContainer = quizEl.createDiv({ cls: 'quiz-sort-container' });
        
        // Create a list for the items
        const sortList = sortContainer.createEl('ul', { cls: 'quiz-sort-list' });
        
        // Create sortable items from options
        quiz.options.forEach(option => {
            const listItem = sortList.createEl('li', { 
                cls: 'quiz-sort-item',
                attr: {
                    'data-option-id': option.id
                }
            });
            
            // Add text content in a separate element
            const textEl = listItem.createDiv({ 
                cls: 'quiz-sort-text',
                text: option.text
            });
            
            // Add handle for dragging
            const handle = listItem.createSpan({ cls: 'quiz-sort-handle' });
            handle.innerHTML = '⋮⋮'; // Unicode vertical ellipsis for drag handle
            
            // Make the whole item draggable
            listItem.setAttribute('draggable', 'true');
            
            // Add drag events
            listItem.addEventListener('dragstart', (e) => {
                listItem.classList.add('dragging');
                if (e.dataTransfer) {
                    e.dataTransfer.setData('text/plain', option.id);
                    e.dataTransfer.effectAllowed = 'move';
                }
            });
            
            listItem.addEventListener('dragend', () => {
                listItem.classList.remove('dragging');
            });
        });
        
        // Add drag and drop functionality to the container
        sortList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(sortList, e.clientY);
            const dragging = sortList.querySelector('.dragging') as HTMLElement;
            
            if (dragging) {
                if (afterElement) {
                    sortList.insertBefore(dragging, afterElement);
                } else {
                    sortList.appendChild(dragging);
                }
            }
        });
        
        // Create submit button
        const submitBtn = quizEl.createEl('button', {
            text: 'Überprüfen',
            cls: 'quiz-submit-btn',
            type: 'button'
        });
        
        // Create result element
        const resultEl = quizEl.createDiv({ cls: 'quiz-result' });
        
        // Add event listener for submit button
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get the current order of items
            const userOrder: string[] = [];
            sortList.querySelectorAll('.quiz-sort-item').forEach((item) => {
                const optionId = (item as HTMLElement).getAttribute('data-option-id');
                if (optionId) {
                    userOrder.push(optionId);
                }
            });
            
            // Check if the order matches the correct order
            const isCorrect = this.compareArrays(userOrder, quiz.answers);
            
            // Update result message
            resultEl.empty();
            
            if (isCorrect) {
                resultEl.setText('Richtig! 🎉');
                resultEl.addClass('quiz-correct');
                resultEl.removeClass('quiz-incorrect');
            } else {
                // Get the option texts for the correct answers
                const correctTexts = quiz.answers.map(id => {
                    const option = quiz.options.find(opt => opt.id === id);
                    return option ? `${option.text}` : id;
                });
                
                resultEl.setText(`Falsch. Die richtige Reihenfolge ist: ${correctTexts.join(' → ')}`);
                resultEl.addClass('quiz-incorrect');
                resultEl.removeClass('quiz-correct');
            }
        });
    }

    getDragAfterElement(container: HTMLElement, y: number): HTMLElement | null {
        const draggableElements = Array.from(
            container.querySelectorAll('.quiz-sort-item:not(.dragging)')
        ) as HTMLElement[];
        
        if (draggableElements.length === 0) return null;
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
    }

    checkAnswers(selected: string[], correct: string[]): boolean {
        if (selected.length !== correct.length) {
            return false;
        }
        
        // Check if all selected options are in correct answers and vice versa
        return selected.every(s => correct.includes(s)) && 
               correct.every(c => selected.includes(c));
    }

    compareArrays(arr1: string[], arr2: string[]): boolean {
        if (arr1.length !== arr2.length) {
            return false;
        }
        
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        
        return true;
    }

    addStyle(): void {
        // Check if the style already exists to avoid duplicates
        if (document.getElementById('quiz-plugin-styles')) {
            return;
        }
        
        // Add custom CSS
        const styleEl = document.createElement('style');
        styleEl.id = 'quiz-plugin-styles';
        styleEl.textContent = `
            .quiz-container {
                padding: 15px;
                border: 1px solid var(--background-modifier-border);
                border-radius: 5px;
                margin: 10px 0;
                background-color: var(--background-secondary);
            }
            
            .quiz-question {
                font-weight: bold;
                margin-bottom: 15px;
                font-size: 1.1em;
            }
            
            .quiz-option {
                margin-bottom: 12px;
                display: flex;
                align-items: flex-start;
            }
            
            .quiz-option input[type="checkbox"],
            .quiz-option input[type="radio"] {
                margin-top: 4px;
                margin-right: 8px;
            }
            
            .quiz-option label {
                flex: 1;
                white-space: pre-wrap;
            }
            
            .quiz-submit-btn {
                margin-top: 10px;
                padding: 6px 12px;
                background-color: var(--interactive-accent);
                color: var(--text-on-accent);
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .quiz-submit-btn:hover {
                background-color: var(--interactive-accent-hover);
            }
            
            .quiz-result {
                margin-top: 10px;
                padding: 8px;
                border-radius: 4px;
            }
            
            .quiz-correct {
                background-color: rgba(0, 128, 0, 0.2);
                color: var(--text-normal);
            }
            
            .quiz-incorrect {
                background-color: rgba(255, 0, 0, 0.2);
                color: var(--text-normal);
            }
            
            /* Text input styling */
            .quiz-text-input {
                margin-bottom: 15px;
            }
            
            .quiz-text-field {
                width: 100%;
                padding: 8px;
                border: 1px solid var(--background-modifier-border);
                border-radius: 4px;
                background-color: var(--background-primary);
                color: var(--text-normal);
            }
            
            /* Fill in the blanks styling */
            .quiz-fill-blank-main {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .quiz-blanks-container {
                margin-bottom: 15px;
                line-height: 2;
                font-size: 1.1em;
            }
            
            .quiz-blank-dropzone {
                display: inline-block;
                min-width: 120px;
                min-height: 30px;
                padding: 2px 5px;
                margin: 0 5px;
                border: 2px dashed var(--background-modifier-border);
                border-radius: 3px;
                background-color: var(--background-primary-alt);
                color: var(--text-normal);
                vertical-align: middle;
                position: relative;
            }
            
            .quiz-blank-dropzone.dragover {
                background-color: rgba(var(--interactive-accent-rgb), 0.2);
                border-color: var(--interactive-accent);
            }
            
            .quiz-blank-placeholder {
                color: var(--text-muted);
                font-style: italic;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            
            .quiz-blank-options-container {
                margin-top: 10px;
                margin-bottom: 10px;
                padding: 10px;
                border: 1px solid var(--background-modifier-border);
                border-radius: 5px;
                background-color: var(--background-primary);
            }
            
            .quiz-blank-options-title {
                font-weight: bold;
                margin-bottom: 8px;
            }
            
            .quiz-blank-options {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-bottom: 5px;
            }
            
            .quiz-blank-option {
                padding: 5px 10px;
                background-color: var(--interactive-normal);
                border-radius: 4px;
                cursor: grab;
                user-select: none;
                transition: all 0.2s ease;
            }
            
            .quiz-blank-option:hover {
                background-color: var(--interactive-hover);
            }
            
            .quiz-blank-option.dragging {
                opacity: 0.4;
            }
            
            .quiz-blank-option.used {
                opacity: 0.5;
                background-color: var(--text-muted);
                cursor: not-allowed;
            }
            
            .quiz-blank-option.in-dropzone {
                background-color: var(--interactive-accent);
                color: var(--text-on-accent);
                cursor: pointer;
            }
            
            .quiz-reset-btn {
                align-self: start;
                margin-right: 10px;
                padding: 6px 12px;
                background-color: var(--text-muted);
                color: var(--text-on-accent);
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .quiz-reset-btn:hover {
                background-color: var(--text-faint);
            }
            
            /* Sorting quiz styling */
            .quiz-sort-container {
                margin-bottom: 15px;
            }
            
            .quiz-sort-list {
                list-style-type: none;
                padding: 0;
                margin: 0;
            }
            
            .quiz-sort-item {
                padding: 10px;
                margin-bottom: 5px;
                background-color: var(--background-primary);
                border: 1px solid var(--background-modifier-border);
                border-radius: 4px;
                cursor: grab;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .quiz-sort-item.dragging {
                opacity: 0.5;
                cursor: grabbing;
                background-color: var(--interactive-hover);
            }
            
            .quiz-sort-text {
                flex: 1;
                padding-right: 30px; /* Space for the handle */
            }
            
            .quiz-sort-handle {
                cursor: grab;
                color: var(--text-muted);
                font-size: 1.2em;
                padding: 0 5px;
            }
            
            /* True/False styling */
            .quiz-tf-options {
                margin-bottom: 15px;
            }
        `;
        document.head.appendChild(styleEl);
    }
}