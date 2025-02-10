(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // Find every textarea with the class 'jocarsa-olive'
    var textareas = document.querySelectorAll('textarea.jocarsa-olive');
    textareas.forEach(function(textarea) {
      // Create the main container
      var container = document.createElement('div');
      container.classList.add('jocarsa-olive-container');

      // Create the line numbers (gutter)
      var lineNumbers = document.createElement('div');
      lineNumbers.classList.add('jocarsa-olive-line-numbers');
      container.appendChild(lineNumbers);

      // Create the editable code area
      var editor = document.createElement('div');
      editor.classList.add('jocarsa-olive-editor');
      editor.setAttribute('contenteditable', 'true');
      // Initialize the editor content from the textarea
      editor.innerText = textarea.value;
      container.appendChild(editor);

      // Create the current line highlight element (positioned behind the editor text)
      var lineHighlight = document.createElement('div');
      lineHighlight.classList.add('jocarsa-olive-current-line-highlight');
      container.appendChild(lineHighlight);

      // Insert the container into the DOM just before the textarea,
      // then hide the original textarea.
      textarea.parentNode.insertBefore(container, textarea);
      textarea.style.display = 'none';

      // --- Helper Functions ---

      // Update the line numbers based on the number of lines in the editor.
      function updateLineNumbers() {
        var lines = editor.innerText.split('\n').length;
        var lineNumbersHTML = '';
        for (var i = 1; i <= lines; i++) {
          lineNumbersHTML += '<div class="line-number">' + i + '</div>';
        }
        lineNumbers.innerHTML = lineNumbersHTML;
      }

      // Synchronize the content of the editor with the textarea.
      function syncEditor() {
        textarea.value = editor.innerText;
        updateLineNumbers();
        highlightCurrentLine();
      }

      // Insert text at the current caret position within the contenteditable element.
      function insertTextAtCursor(element, text) {
        var sel, range;
        if (window.getSelection) {
          sel = window.getSelection();
          if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            var textNode = document.createTextNode(text);
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      }

      // Highlight the current line’s number in the gutter and
      // update the background highlight in the editor.
      function highlightCurrentLine() {
        // --- Gutter Highlighting ---
        // Remove any existing highlights.
        var lineDivs = lineNumbers.querySelectorAll('.line-number');
        lineDivs.forEach(function(div) {
          div.classList.remove('active');
        });

        var selection = window.getSelection();
        if (selection.rangeCount === 0) {
          lineHighlight.style.display = 'none';
          return;
        }
        var range = selection.getRangeAt(0);

        // Only proceed if the selection is inside the editor.
        if (!editor.contains(range.startContainer)) {
          lineHighlight.style.display = 'none';
          return;
        }

        // Clone the range to get text from the beginning up to the caret.
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editor);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        var textBeforeCaret = preCaretRange.toString();
        var lineIndex = textBeforeCaret.split('\n').length - 1;
        if (lineDivs[lineIndex]) {
          lineDivs[lineIndex].classList.add('active');
        }

        // --- Editor Background Highlight ---
        // Use the caret's bounding rectangle to position the highlight.
        var caretRect = range.getBoundingClientRect();
        var containerRect = container.getBoundingClientRect();
        var editorRect = editor.getBoundingClientRect();

        // Calculate the top position relative to the container.
        // (Since container is our positioning context.)
        var highlightTop = caretRect.top - containerRect.top;
        
        // Get the computed line-height of the editor.
        var computedStyle = window.getComputedStyle(editor);
        var lineHeight = parseFloat(computedStyle.lineHeight);
        if (isNaN(lineHeight)) {
          lineHeight = 20; // Fallback value.
        }
        
        // Position the highlight element.
        lineHighlight.style.top = highlightTop + "px";
        lineHighlight.style.height = lineHeight + "px";
        // Position it exactly over the editor area.
        var gutterWidth = lineNumbers.offsetWidth;
        // Position left relative to the container.
        var editorLeft = editor.getBoundingClientRect().left - containerRect.left;
        lineHighlight.style.left = editorLeft + "px";
        lineHighlight.style.width = editorRect.width + "px";
        lineHighlight.style.display = 'block';
      }

      // --- Event Listeners ---

      // Listen for changes in the editor content.
      editor.addEventListener('input', function() {
        syncEditor();
      });

      // Handle the Tab key for indentation.
      editor.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
          e.preventDefault();
          insertTextAtCursor(editor, '    '); // Insert four spaces.
          syncEditor();
        }
      });

      // Update the highlighted line when the caret moves.
      editor.addEventListener('keyup', highlightCurrentLine);
      editor.addEventListener('click', highlightCurrentLine);

      // Synchronize scrolling between the editor and line numbers,
      // and update the current line highlight on scroll.
      editor.addEventListener('scroll', function() {
        lineNumbers.scrollTop = editor.scrollTop;
        highlightCurrentLine();
      });

      // Initial setup: update line numbers and highlight the first line.
      updateLineNumbers();
      highlightCurrentLine();
    });
  });
})();

