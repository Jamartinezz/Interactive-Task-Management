// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    // Get DOM elements
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskBoard = document.getElementById('taskBoard');
    const completedBoard = document.getElementById('completedBoard');
    const tomorrowBoard = document.getElementById('tomorrowBoard');
    
    // Modal elements
    const noteModal = document.getElementById('noteModal');
    const noteContent = document.getElementById('noteContent');
    const saveNoteBtn = document.getElementById('saveNote');
    const closeModalBtn = document.querySelector('.close-modal');
    
    // Keep track of the current task being edited
    let currentEditingTask = null;
    
    // Simple function to add a task
    function addTask() {
        console.log("Add task function called");
        const taskText = taskInput.value.trim();
        console.log("Task text:", taskText);
        
        if (taskText !== '') {
            // Create the card elements
            const card = document.createElement('div');
            card.className = 'card';
            card.draggable = true;
            card.dataset.notes = ""; // Initialize empty notes
            
            // Add the task text and buttons
            card.innerHTML = `
                <div class="card-content">
                    <div>${taskText}</div>
                    <div class="card-buttons">
                        <button class="notes-btn">Notes</button>
                        <button class="delete-btn">Delete</button>
                    </div>
                </div>
                <textarea class="task-notes" placeholder="Add notes for this task..."></textarea>
            `;
            
            // Get references to elements
            const deleteBtn = card.querySelector('.delete-btn');
            const notesBtn = card.querySelector('.notes-btn');
            const taskNotes = card.querySelector('.task-notes');
            
            // Add delete functionality
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent drag events
                card.remove();
                saveTasksToStorage();
            });
            
            // Add notes toggle functionality (inline notes)
            notesBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent drag events
                openNoteModal(card, taskText);
            });
            
            // Save notes when textarea loses focus
            taskNotes.addEventListener('blur', function() {
                card.dataset.notes = taskNotes.value;
                saveTasksToStorage();
            });
            
            // Add drag functionality
            card.addEventListener('dragstart', function(e) {
                card.classList.add('dragging');
                e.dataTransfer.setData('text/plain', '');
            });
            
            card.addEventListener('dragend', function() {
                card.classList.remove('dragging');
                saveTasksToStorage();
            });
            
            // Add the card to the task board
            taskBoard.appendChild(card);
            
            // Clear the input
            taskInput.value = '';
            
            // Save to localStorage
            saveTasksToStorage();
        }
    }
    
    // Function to open the note modal
    function openNoteModal(card, taskTitle) {
        currentEditingTask = card;
        
        // Set the modal title and content
        document.querySelector('.modal-title').textContent = `Notes for: ${taskTitle}`;
        noteContent.value = card.dataset.notes || '';
        
        // Show the modal
        noteModal.style.display = 'flex';
    }
    
    // Function to close the modal
    function closeModal() {
        noteModal.style.display = 'none';
        currentEditingTask = null;
    }
    
    // Save the note from the modal
    function saveNote() {
        if (currentEditingTask) {
            currentEditingTask.dataset.notes = noteContent.value;
            currentEditingTask.querySelector('.task-notes').value = noteContent.value;
            saveTasksToStorage();
            closeModal();
        }
    }
    
    // Add event listeners for the modal
    saveNoteBtn.addEventListener('click', saveNote);
    closeModalBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === noteModal) {
            closeModal();
        }
    });
    
    // Add event listeners
    addBtn.addEventListener('click', function() {
        addTask();
    });
    
    // Enter key event
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    // Set up drag and drop for boards
    const boards = document.querySelectorAll('.board');
    boards.forEach(board => {
        // Allow dropping
        board.addEventListener('dragover', function(e) {
            e.preventDefault();
        });
        
        // Handle drop
        board.addEventListener('drop', function(e) {
            e.preventDefault();
            const draggedItem = document.querySelector('.dragging');
            if (draggedItem) {
                board.appendChild(draggedItem);
                saveTasksToStorage();
            }
        });
    });
    
    // Save tasks to localStorage
    function saveTasksToStorage() {
        console.log("Saving tasks to storage");
        
        // Function to extract task data
        function extractTaskData(card) {
            return {
                text: card.querySelector('.card-content div').textContent,
                notes: card.dataset.notes || ""
            };
        }
        
        // Get tasks from each board
        const tasks = Array.from(taskBoard.querySelectorAll('.card')).map(extractTaskData);
        const completed = Array.from(completedBoard.querySelectorAll('.card')).map(extractTaskData);
        const tomorrow = Array.from(tomorrowBoard.querySelectorAll('.card')).map(extractTaskData);
        
        // Save to localStorage
        const taskData = { tasks, completed, tomorrow };
        localStorage.setItem('todoTasks', JSON.stringify(taskData));
    }
    
    // Load tasks from localStorage
    function loadTasksFromStorage() {
        console.log("Loading tasks from storage");
        const savedTasks = localStorage.getItem('todoTasks');
        
        if (savedTasks) {
            try {
                const taskData = JSON.parse(savedTasks);
                
                // Load tasks into each board
                if (taskData.tasks && Array.isArray(taskData.tasks)) {
                    taskData.tasks.forEach(task => createTaskInBoard(taskBoard, task));
                }
                
                if (taskData.completed && Array.isArray(taskData.completed)) {
                    taskData.completed.forEach(task => createTaskInBoard(completedBoard, task));
                }
                
                if (taskData.tomorrow && Array.isArray(taskData.tomorrow)) {
                    taskData.tomorrow.forEach(task => createTaskInBoard(tomorrowBoard, task));
                }
            } catch (error) {
                console.error("Error loading tasks:", error);
            }
        }
    }
    
    // Helper to create a task in a specific board
    function createTaskInBoard(board, taskData) {
        // Handle both string and object formats for backwards compatibility
        const taskText = typeof taskData === 'string' ? taskData : taskData.text;
        const taskNotes = typeof taskData === 'string' ? "" : (taskData.notes || "");
        
        // Create the card
        const card = document.createElement('div');
        card.className = 'card';
        card.draggable = true;
        card.dataset.notes = taskNotes;
        
        // Add content
        card.innerHTML = `
            <div class="card-content">
                <div>${taskText}</div>
                <div class="card-buttons">
                    <button class="notes-btn">Notes</button>
                    <button class="delete-btn">Delete</button>
                </div>
            </div>
            <textarea class="task-notes" placeholder="Add notes for this task...">${taskNotes}</textarea>
        `;
        
        // Get references to elements
        const deleteBtn = card.querySelector('.delete-btn');
        const notesBtn = card.querySelector('.notes-btn');
        const notesTextarea = card.querySelector('.task-notes');
        
        // Add delete functionality
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            card.remove();
            saveTasksToStorage();
        });
        
        // Add notes functionality
        notesBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            openNoteModal(card, taskText);
        });
        
        // Save notes when textarea loses focus
        notesTextarea.addEventListener('blur', function() {
            card.dataset.notes = notesTextarea.value;
            saveTasksToStorage();
        });
        
        // Add drag functionality
        card.addEventListener('dragstart', function(e) {
            card.classList.add('dragging');
            e.dataTransfer.setData('text/plain', '');
        });
        
        card.addEventListener('dragend', function() {
            card.classList.remove('dragging');
            saveTasksToStorage();
        });
        
        // Add to board
        board.appendChild(card);
    }
    
    // Load any saved tasks
    loadTasksFromStorage();
});