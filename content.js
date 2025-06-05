let styleElement = null; // Keep a reference to the <style> element
const styleTagId = "customTaskCountStyle";
let titleElementObserver = null; // Observer for the #titleSection-title
let taskListObserver = null; // Observer for changes in the task list

// Function to calculate task count and update/apply the CSS ::after pseudo-element
function updateAndApplyStyles() {
  const targetElement = document.getElementById("titleSection-title");

  // If the title element isn't there (e.g., navigated away or UI changed), stop.
  if (!targetElement) {
    console.log(
      "MUI List Counter Inserter: '#titleSection-title' no longer found. Cannot update styles."
    );
    if (taskListObserver) taskListObserver.disconnect(); // Stop observing tasks if title is gone
    return false;
  }

  const taskCount = document
    .querySelector('[id^="settings-section-title-:r8:"]')
    .parentElement.querySelectorAll("ul.MuiList-root>div").length;
  console.log(`MUI List Counter Inserter: Current task count: ${taskCount}`);

  // Get or create the <style> tag
  if (!styleElement) {
    styleElement = document.getElementById(styleTagId);
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleTagId;
      document.head.appendChild(styleElement);
    }
  }

  const cssRule = `
      #titleSection-title::after {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.8rem;
        height: 2.8rem;
        border-radius: 50%;
        background-color: red;
        color: white;
        font-size: 1rem;
        font-weight: bold;
        line-height: 1;
        font-family: sans-serif;
        margin-left: 0.5em;
        vertical-align: super;
        content: "${taskCount}";
        text-decoration: none;
        text-transform: none;
      }
    `;
  styleElement.textContent = cssRule;
  console.log(
    `MUI List Counter Inserter: CSS ::after rule updated for #titleSection-title with count ${taskCount}.`
  );
  return true;
}

// Sets up the MutationObserver to watch for changes in the task list
function setupTaskListObserver() {
  // Disconnect any previous task list observer to avoid duplicates
  if (taskListObserver) {
    taskListObserver.disconnect();
  }

  // Define the element to observe for task changes.
  // document.body is a general choice. If ul.MuiList-root elements are always within a specific known container,
  // observing that more specific container would be more performant.
  const taskContainerToObserve = document.body; // Or a more specific stable parent of ul.MuiList-root

  taskListObserver = new MutationObserver((mutationsList, obs) => {
    // For simplicity, we re-calculate and update on any relevant DOM change.
    // We could inspect mutationsList for more targeted updates if performance became an issue.
    console.log("MUI List Counter Inserter: Task list mutation detected.");
    updateAndApplyStyles();
  });

  // Observe for additions/removals of child elements, and changes in the subtree
  taskListObserver.observe(taskContainerToObserve, {
    childList: true,
    subtree: true,
  });
  console.log("MUI List Counter Inserter: Task list observer is now active.");
}

// Initializes the observer to find the #titleSection-title element
function initializeTitleElementObserver() {
  const targetElement = document.getElementById("titleSection-title");

  if (targetElement) {
    console.log(
      "MUI List Counter Inserter: '#titleSection-title' found on initial check."
    );
    updateAndApplyStyles(); // Apply styles with initial count
    setupTaskListObserver(); // Start observing task list for dynamic updates
    return;
  }

  console.log(
    "MUI List Counter Inserter: '#titleSection-title' not found initially. Setting up title element observer."
  );
  // Disconnect previous observer if any (e.g., script re-injected)
  if (titleElementObserver) {
    titleElementObserver.disconnect();
  }

  titleElementObserver = new MutationObserver((mutationsList, obs) => {
    const currentTitleElement = document.getElementById("titleSection-title");
    const taskElement = document.querySelector("ul.MuiList-root");
    if (currentTitleElement && taskElement) {
      console.log(
        "MUI List Counter Inserter: '#titleSection-title' detected by title observer."
      );
      obs.disconnect(); // Stop observing for the title element itself
      titleElementObserver = null; // Clear the observer instance

      updateAndApplyStyles(); // Apply styles with initial count
      setupTaskListObserver(); // Start observing task list for dynamic updates
      console.log(
        "MUI List Counter Inserter: Title element observer disconnected."
      );
    }
  });

  // Observe the entire document for the appearance of #titleSection-title
  titleElementObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Safety timeout for the title observer
  setTimeout(() => {
    if (titleElementObserver) {
      // Check if it's still active (i.e., title not found)
      console.log(
        "MUI List Counter Inserter: Title element observer timed out. '#titleSection-title' not found. Disconnecting."
      );
      titleElementObserver.disconnect();
      titleElementObserver = null;
    }
  }, 30000); // 30-second timeout
}

// --- Script Entry Point ---
// `run_at: "document_idle"` in manifest.json is the primary control for when the script loads.
// This check is an additional safeguard.
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  initializeTitleElementObserver();
} else {
  document.addEventListener("DOMContentLoaded", initializeTitleElementObserver);
}
