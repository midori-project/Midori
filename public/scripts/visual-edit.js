/**
 * Visual Edit Mode Script
 * Inject ใน iframe เพื่อจัดการ click-to-edit functionality
 */

(function() {
  let editModeEnabled = false;
  let selectedElement = null;

  console.log('🎨 Visual Edit script loaded');

  // Listen for commands from parent window
  window.addEventListener('message', (event) => {
    if (event.data.type === 'TOGGLE_EDIT_MODE') {
      editModeEnabled = event.data.enabled;
      document.body.classList.toggle('midori-edit-mode', editModeEnabled);
      
      // 🔑 FREEZE หน้าเว็บเมื่อเข้า edit mode
      if (editModeEnabled) {
        // Disable pointer events บนทุกอย่าง
        document.body.style.pointerEvents = 'none';
        // Enable เฉพาะ editable elements
        document.querySelectorAll('[data-editable]').forEach(el => {
          el.style.pointerEvents = 'auto';
        });
        console.log('🔒 Page frozen - only editable elements clickable');
      } else {
        // Restore ทุกอย่างกลับมา
        document.body.style.pointerEvents = '';
        document.querySelectorAll('[data-editable]').forEach(el => {
          el.style.pointerEvents = '';
        });
        console.log('🔓 Page unfrozen');
      }
      
      console.log('🎨 Edit mode:', editModeEnabled ? 'ON' : 'OFF');
      
      if (!editModeEnabled && selectedElement) {
        selectedElement.classList.remove('midori-selected');
        selectedElement = null;
      }
    }
  });

  // Hover effect - ใช้ capture phase เพื่อจับก่อน React
  document.addEventListener('mouseover', (e) => {
    if (!editModeEnabled) return;
    
    const editable = e.target.closest('[data-editable]');
    if (editable && editable !== selectedElement) {
      editable.classList.add('midori-hover');
    }
  }, true); // 🔑 ใช้ capture phase

  document.addEventListener('mouseout', (e) => {
    if (!editModeEnabled) return;
    
    const editable = e.target.closest('[data-editable]');
    if (editable) {
      editable.classList.remove('midori-hover');
    }
  }, true); // 🔑 ใช้ capture phase

  // Click to select - ใช้ capture phase เพื่อจับก่อน React
  document.addEventListener('click', (e) => {
    if (!editModeEnabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation(); // 🔑 หยุด event ทั้งหมด

    // 🔑 ตรวจสอบว่า target เองมี data-editable หรือไม่ก่อน
    let editable = e.target;
    if (!editable.hasAttribute('data-editable')) {
      editable = e.target.closest('[data-editable]');
    }
    
    // 🔑 ถ้า editable เป็น menu-item ให้หา child ที่เป็น image แทน
    if (editable && editable.dataset.type === 'menu-item') {
      const imageChild = e.target.closest('[data-type="image"]');
      if (imageChild) {
        editable = imageChild;
      }
    }
    
    if (!editable) {
      console.log('⚠️ Clicked outside editable area');
      return;
    }

    console.log('🎯 Element clicked:', editable.dataset);

    // Remove previous selection
    if (selectedElement) {
      selectedElement.classList.remove('midori-selected');
    }

    // Add new selection
    editable.classList.add('midori-selected');
    selectedElement = editable;

    // Extract data from attributes
    const data = {
      blockId: editable.dataset.blockId,
      field: editable.dataset.field,
      type: editable.dataset.type,
      itemIndex: editable.dataset.itemIndex,
      currentValue: extractCurrentValue(editable),
      rect: editable.getBoundingClientRect()
    };

    console.log('📤 Sending to parent:', data);

    // Send to parent window
    window.parent.postMessage({
      type: 'ELEMENT_SELECTED',
      data
    }, '*');
  }, true); // 🔑 ใช้ capture phase - สำคัญมาก!

  /**
   * Extract current value from element
   */
  function extractCurrentValue(element) {
    const type = element.dataset.type;
    
    if (type === 'image') {
      // For images, get src attribute
      const img = element.querySelector('img') || element;
      return img.src || '';
    }
    
    // For text elements, get text content
    return element.textContent?.trim() || '';
  }

  // Inject CSS for visual feedback
  const style = document.createElement('style');
  style.textContent = `
    /* Visual Edit Mode Styles */
    .midori-edit-mode {
      cursor: default !important;
    }
    
    /* 🔑 FREEZE ทุก element ในหน้าเว็บ */
    .midori-edit-mode * {
      pointer-events: none !important;
    }
    
    /* 🔑 ENABLE เฉพาะ editable elements */
    .midori-edit-mode [data-editable] {
      pointer-events: auto !important;
      transition: all 0.2s ease;
      cursor: pointer !important;
      position: relative;
    }
    
    /* 🔑 ENABLE child elements ของ editable ด้วย */
    .midori-edit-mode [data-editable] * {
      pointer-events: auto !important;
    }
    
    /* 🎨 Hover effect - ปกติ (text, buttons) - ไม่ปรับ z-index */
    .midori-edit-mode [data-editable]:hover {
      outline: 2px dashed #3b82f6 !important;
      outline-offset: 2px;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
    }
    
    /* 🖼️ Hover effect - สำหรับ background images */
    .midori-edit-mode [data-type="image"]:hover {
      outline: 3px dashed #f59e0b !important;
      outline-offset: 4px;
      box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2) !important;
      position: relative !important;
      z-index: 9999 !important;
    }

    /* 🔑 ให้ image elements อยู่บนสุดเสมอ */
  .midori-edit-mode [data-type="image"] {
  z-index: 9999 !important;
  position: relative !important;
}
    
    /* Selected state - ปกติ */
    [data-editable].midori-selected {
      outline: 3px solid #3b82f6 !important;
      outline-offset: 2px;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
    }
    
    /* 🖼️ Selected - สำหรับ background images */
    [data-type="image"].midori-selected {
      outline: 3px solid #3b82f6 !important;
      outline-offset: 4px;
      box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.3) !important;
      position: relative !important;
      z-index: 9999 !important;
    }
    
    /* Tooltip showing field name */
    .midori-edit-mode [data-editable]:hover::after {
      content: attr(data-field);
      position: absolute;
      top: -28px;
      left: 0;
      background: #3b82f6;
      color: white;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      white-space: nowrap;
      z-index: 10001;
      pointer-events: none !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    
    /* Arrow for tooltip */
    .midori-edit-mode [data-editable]:hover::before {
      content: '';
      position: absolute;
      top: -8px;
      left: 10px;
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid #3b82f6;
      z-index: 10001;
      pointer-events: none !important;
    }
    
    /* 🎨 Special styling - Heading */
    .midori-edit-mode [data-type="heading"]:hover {
      outline-color: #10b981 !important;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1) !important;
    }
    
    .midori-edit-mode [data-type="heading"].midori-selected {
      outline-color: #10b981 !important;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
    }
    
    /* 🔘 Special styling - Button */
    .midori-edit-mode [data-type="button"]:hover {
      outline-color: #8b5cf6 !important;
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1) !important;
    }
    
    .midori-edit-mode [data-type="button"].midori-selected {
      outline-color: #8b5cf6 !important;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2) !important;
    }
  `;
  document.head.appendChild(style);

  console.log('✅ Visual Edit script initialized');
})();

