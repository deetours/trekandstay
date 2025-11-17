// Small utility to manage body lock state when one or more modals are open.
// Uses a counter so multiple modals can coexist without stomping each other's styles.
let openCount = 0;
const original = {
  overflow: '' as string | null,
  position: '' as string | null,
  width: '' as string | null,
  height: '' as string | null,
  top: '' as string | null,
};

export function lockBodyScroll() {
  try {
    if (openCount === 0) {
      // Save original inline styles so we can restore later
      original.overflow = document.body.style.overflow;
      original.position = document.body.style.position;
      original.width = document.body.style.width;
      original.height = document.body.style.height;
      original.top = document.body.style.top;

      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100vh';
      // do not set top here; callers that need scroll lock with position fixed
      // should set top themselves if they want to preserve scroll position
      document.body.classList.add('modal-open');
      document.documentElement.style.overflow = 'hidden';
    }
    openCount += 1;
  } catch {
    // ignore DOM errors
  }
}

export function unlockBodyScroll(force = false) {
  try {
    if (force) openCount = 0;
    else openCount = Math.max(0, openCount - 1);

    if (openCount === 0) {
      // Restore saved inline styles
      document.body.style.overflow = original.overflow || '';
      document.body.style.position = original.position || '';
      document.body.style.width = original.width || '';
      document.body.style.height = original.height || '';
      document.body.style.top = original.top || '';
      document.body.classList.remove('modal-open');
      document.documentElement.style.overflow = '';
    }
  } catch {
    // ignore DOM errors
  }
}

export function getOpenModalCount() {
  return openCount;
}
