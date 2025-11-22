# 🧩 CSP Sudoku Solver Visualizer

This project provides an interactive visualization tool for exploring common Constraint Satisfaction Problem (CSP) algorithms, specifically applied to solving the classic 9x9 Sudoku puzzle. It allows users to observe the steps taken by different search strategies, such as **Arc Consistency (AC-3)** and **Backtracking**, in real-time.

## ✨ Features

* **Interactive Sudoku Grid:** Input custom puzzles or load predefined difficulties.
* **Real-time Visualization:** Watch the solver fill cells, highlight consistency checks, and manage variable domains.
* **Multiple Strategies:** Select between simple **Arc Consistency (AC-3)**, **Backtracking**, or a **Hybrid** approach (basic AC-3 is implemented in the current JS logic).
* **Domain Inspection:** Click any empty cell to view its currently **available domain** (possible values).
* **Activity Log:** A detailed log tracks every significant step, including domain reduction, assignments, and backtracking (when implemented).
* **Adjustable Speed:** Control the animation speed to better understand the algorithms.

## 🚀 Getting Started

This is a front-end application and requires no server or build tools to run.

### Prerequisites

You only need a modern web browser (Chrome, Firefox, Edge, Safari).

### Installation and Execution

1.  **Save the files:** Save the three provided code blocks into separate files in the same folder:
    * `index.html` (The structure)
    * `style.css` (The styling)
    * `script.js` (The logic and solver)
2.  **Open in Browser:** Double-click `index.html` to open the application in your preferred web browser.

## ⚙️ How to Use

1.  **Load a Puzzle:**
    * Use the **Puzzle Difficulty** dropdown to select a predefined puzzle (Beginner, Expert, etc.).
    * Click **🎨 Create Custom** to clear the grid, then click into the cells and type your own initial puzzle numbers.
2.  **Select Strategy:** Choose a **Solving Strategy** from the dropdown menu (e.g., `AC-3` for propagation-based solving).
3.  **Set Speed:** Adjust the **Animation Speed** slider (🐢 Slow to 🐇 Fast).
4.  **Execute:** Click the **▶️ Execute Solver** button to start the visualization.
5.  **Inspect:** While the solver runs, click cells to see the **Domain for Selected Cell** update in the Info Panel.

## 💻 Code Structure

The project is cleanly separated into three files:

| File | Role | Description |
| :--- | :--- | :--- |
| `index.html` | **HTML** | Defines the layout, including the grid container, control panel, and info panel elements. Links CSS and JavaScript files. |
| `style.css` | **CSS** | Provides the modern, gradient-based styling and sets up the responsive grid layout. Includes animations for visual feedback on cell changes. |
| `script.js` | **JavaScript** | Contains the core logic: Sudoku **state** management, **Constraint Checking** (`computeValidDomain`), **Visualization Control** (`highlightCell`), and the **Simplified CSP Solver** (`executeSolver`). |

## 🧠 Core CSP Concepts

The solver demonstrates these core concepts:

* **Variables:** The 81 empty cells in the Sudoku grid.
* **Domain:** The set of possible values $\{1, 2, \dots, 9\}$ for each unassigned cell.
* **Constraints:** The rules of Sudoku (All-Diff constraint): Each row, column, and 3x3 box must contain the numbers 1 through 9 exactly once.
* **Inference/Propagation:** The `executeSolver` loop incorporates a simplified form of **Arc Consistency (AC-3)** by checking for **Naked Singles** (cells whose domain reduces to a single value) and immediately assigning them. This assignment triggers further propagation.
