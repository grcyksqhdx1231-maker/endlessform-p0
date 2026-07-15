const SVG_NS = 'http://www.w3.org/2000/svg';

export interface ChairSelection {
  id: string;
  role: 'hub' | 'leaf';
  chairSymbol: string;
  clusterId?: string;
  parentId?: string;
}

export interface ChairGenealogyOptions {
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  focusPadding?: number;
  animateOnMount?: boolean;
  onChairSelect?: (selection: ChairSelection) => void;
}

export interface ChairGenealogyController {
  reset: () => void;
  focusNode: (nodeId: string) => void;
  destroy: () => void;
}

interface TransformState {
  x: number;
  y: number;
  scale: number;
}

interface PointerInfo {
  x: number;
  y: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export function createChairGenealogy(
  host: HTMLElement,
  svgMarkup: string,
  options: ChairGenealogyOptions = {},
): ChairGenealogyController {
  const initialScale =
    options.initialScale ??
    (window.matchMedia('(max-width: 720px)').matches ? 1.42 : 1);
  const minScale = options.minScale ?? 0.8;
  const maxScale = options.maxScale ?? 3.2;
  const focusPadding = options.focusPadding ?? 96;

  host.classList.add('chair-tree');
  host.innerHTML = `
    <div class="chair-tree__stage" aria-label="Endless Form 椅子谱系图"></div>
    <div class="chair-tree__toolbar">
      <button class="chair-tree__reset" type="button" aria-label="重置视图">Reset</button>
      <span class="chair-tree__status" aria-live="polite">拖动浏览 · 双指缩放 · 点击椅子聚焦</span>
    </div>
  `;

  const stage = host.querySelector<HTMLElement>('.chair-tree__stage');
  const resetButton = host.querySelector<HTMLButtonElement>('.chair-tree__reset');
  const status = host.querySelector<HTMLElement>('.chair-tree__status');

  if (!stage || !resetButton || !status) {
    throw new Error('Chair genealogy mount failed: required DOM elements are missing.');
  }

  stage.innerHTML = svgMarkup;

  const svg = stage.querySelector<SVGSVGElement>('svg');
  const edges = svg?.querySelector<SVGGElement>('#edges');
  const nodes = svg?.querySelector<SVGGElement>('#nodes');

  if (!svg || !edges || !nodes) {
    throw new Error('Chair genealogy SVG is missing #edges or #nodes.');
  }

  svg.classList.add('chair-tree__svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute(
    'preserveAspectRatio',
    host.clientWidth <= 720 ? 'xMidYMid slice' : 'xMidYMid meet',
  );
  svg.setAttribute('tabindex', '0');

  const viewBox = svg.viewBox.baseVal;
  const viewport = document.createElementNS(SVG_NS, 'g');
  viewport.id = 'chair-tree-viewport';

  edges.parentNode?.insertBefore(viewport, edges);
  viewport.append(edges, nodes);

  const rootNode = svg.querySelector<SVGGElement>('#root');
  const rootX = Number(rootNode?.getAttribute('transform')?.match(/translate\(([-\d.]+)/)?.[1] ?? viewBox.width / 2);
  const rootY = Number(rootNode?.getAttribute('transform')?.match(/translate\([-\d.]+\s+([-\d.]+)/)?.[1] ?? viewBox.height / 2);

  const defaultState: TransformState = {
    scale: initialScale,
    x: viewBox.width / 2 - rootX * initialScale,
    y: viewBox.height / 2 - rootY * initialScale,
  };

  let state: TransformState = { ...defaultState };
  let animationFrame = 0;
  let destroyed = false;
  let dragMoved = false;

  const pointers = new Map<number, PointerInfo>();
  let panStart: { pointer: PointerInfo; state: TransformState } | null = null;
  let pinchStart:
    | {
        distance: number;
        worldX: number;
        worldY: number;
        scale: number;
      }
    | null = null;
  let touchGestureActive = false;
  let touchReleaseTimer = 0;

  const applyTransform = (): void => {
    viewport.setAttribute(
      'transform',
      `translate(${state.x.toFixed(3)} ${state.y.toFixed(3)}) scale(${state.scale.toFixed(5)})`,
    );
  };

  const clientToSvg = (clientX: number, clientY: number): PointerInfo => {
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const matrix = svg.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const local = point.matrixTransform(matrix.inverse());
    return { x: local.x, y: local.y };
  };

  const preventNativeTouch = (event: Event): void => {
    if (event.cancelable) event.preventDefault();
    event.stopPropagation();
  };

  const markTouchGestureActive = (): void => {
    touchGestureActive = true;
    window.clearTimeout(touchReleaseTimer);
  };

  const releaseTouchGestureSoon = (): void => {
    window.clearTimeout(touchReleaseTimer);
    touchReleaseTimer = window.setTimeout(() => {
      touchGestureActive = false;
    }, 90);
  };

  const animateTo = (target: TransformState, duration = 420): void => {
    cancelAnimationFrame(animationFrame);
    const from = { ...state };
    const started = performance.now();

    const ease = (t: number): number =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const tick = (now: number): void => {
      const progress = clamp((now - started) / duration, 0, 1);
      const eased = ease(progress);
      state = {
        x: from.x + (target.x - from.x) * eased,
        y: from.y + (target.y - from.y) * eased,
        scale: from.scale + (target.scale - from.scale) * eased,
      };
      applyTransform();
      if (progress < 1 && !destroyed) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    animationFrame = requestAnimationFrame(tick);
  };

  const zoomAt = (point: PointerInfo, nextScale: number): void => {
    const scale = clamp(nextScale, minScale, maxScale);
    const worldX = (point.x - state.x) / state.scale;
    const worldY = (point.y - state.y) / state.scale;

    state = {
      scale,
      x: point.x - worldX * scale,
      y: point.y - worldY * scale,
    };
    applyTransform();
  };

  const clearHighlight = (): void => {
    svg.querySelectorAll<SVGElement>('.is-dimmed, .is-active').forEach((element) => {
      element.classList.remove('is-dimmed', 'is-active');
    });
    status.textContent = '拖动浏览 · 双指缩放 · 点击椅子聚焦';
  };

  const getConnectedNodeIds = (node: SVGGElement): Set<string> => {
    const ids = new Set<string>();
    ids.add(node.id);

    if (node.classList.contains('node-hub')) {
      svg
        .querySelectorAll<SVGGElement>(`.node-leaf[data-cluster="${CSS.escape(node.id)}"]`)
        .forEach((leaf) => ids.add(leaf.id));

      svg
        .querySelectorAll<SVGGElement>(`.node-hub[data-parent="${CSS.escape(node.id)}"]`)
        .forEach((childHub) => ids.add(childHub.id));

      const parentId = node.dataset.parent;
      if (parentId) ids.add(parentId);
    } else {
      const clusterId = node.dataset.cluster;
      if (clusterId) {
        ids.add(clusterId);
        const hub = svg.querySelector<SVGGElement>(`#${CSS.escape(clusterId)}`);
        const parentId = hub?.dataset.parent;
        if (parentId) ids.add(parentId);
      }
    }

    ids.add('root');
    return ids;
  };

  const highlightNode = (node: SVGGElement): void => {
    const relatedIds = getConnectedNodeIds(node);

    svg.querySelectorAll<SVGGElement>('.node').forEach((item) => {
      item.classList.toggle('is-active', relatedIds.has(item.id));
      item.classList.toggle('is-dimmed', !relatedIds.has(item.id));
    });

    svg.querySelectorAll<SVGLineElement>('.edge').forEach((edge) => {
      const source = edge.dataset.source ?? '';
      const target = edge.dataset.target ?? '';
      const related = relatedIds.has(source) && relatedIds.has(target);
      edge.classList.toggle('is-active', related);
      edge.classList.toggle('is-dimmed', !related);
    });
  };

  const unionBBox = (elements: SVGGraphicsElement[]): DOMRect => {
    const boxes = elements.map((element) => element.getBBox());
    const minX = Math.min(...boxes.map((box) => box.x));
    const minY = Math.min(...boxes.map((box) => box.y));
    const maxX = Math.max(...boxes.map((box) => box.x + box.width));
    const maxY = Math.max(...boxes.map((box) => box.y + box.height));

    return new DOMRect(minX, minY, maxX - minX, maxY - minY);
  };

  const focusNode = (nodeId: string): void => {
    const node = svg.querySelector<SVGGElement>(`#${CSS.escape(nodeId)}`);
    if (!node) return;

    const relatedIds = getConnectedNodeIds(node);
    const relatedElements = [...relatedIds]
      .map((id) => svg.querySelector<SVGGraphicsElement>(`#${CSS.escape(id)}`))
      .filter((element): element is SVGGraphicsElement => Boolean(element));

    const box = unionBBox(relatedElements.length ? relatedElements : [node]);
    const targetScale = clamp(
      Math.min(
        (viewBox.width - focusPadding * 2) / Math.max(box.width, 1),
        (viewBox.height - focusPadding * 2) / Math.max(box.height, 1),
      ),
      minScale,
      maxScale,
    );

    const target: TransformState = {
      scale: targetScale,
      x: viewBox.width / 2 - (box.x + box.width / 2) * targetScale,
      y: viewBox.height / 2 - (box.y + box.height / 2) * targetScale,
    };

    highlightNode(node);
    animateTo(target);
  };

  const readSelection = (node: SVGGElement): ChairSelection => ({
    id: node.id,
    role: node.classList.contains('node-hub') ? 'hub' : 'leaf',
    chairSymbol: node.dataset.chair ?? '',
    clusterId: node.dataset.cluster,
    parentId: node.dataset.parent,
  });

  const handleNodeActivate = (node: SVGGElement): void => {
    const selection = readSelection(node);
    focusNode(node.id);
    status.textContent =
      selection.role === 'hub'
        ? `系列：${selection.chairSymbol.replace('chair-', '')}`
        : `椅子：${selection.chairSymbol.replace('chair-', '')}`;

    options.onChairSelect?.(selection);
    host.dispatchEvent(
      new CustomEvent<ChairSelection>('chairselect', {
        detail: selection,
        bubbles: true,
      }),
    );
  };

  svg.querySelectorAll<SVGGElement>('.node-hub, .node-leaf').forEach((node) => {
    node.setAttribute('tabindex', '0');
    node.setAttribute('role', 'button');

    node.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!dragMoved) handleNodeActivate(node);
    });

    node.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleNodeActivate(node);
      }
    });
  });

  const reset = (): void => {
    clearHighlight();
    animateTo({ ...defaultState });
  };

  const handleWheel = (event: WheelEvent): void => {
    event.preventDefault();
    const point = clientToSvg(event.clientX, event.clientY);
    const factor = Math.exp(-event.deltaY * 0.0016);
    zoomAt(point, state.scale * factor);
  };

  const updatePinchStart = (): void => {
    const values = [...pointers.values()];
    if (values.length !== 2) {
      pinchStart = null;
      return;
    }

    const [a, b] = values;
    const midpoint = {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
    };
    const distance = Math.hypot(a.x - b.x, a.y - b.y);

    pinchStart = {
      distance,
      scale: state.scale,
      worldX: (midpoint.x - state.x) / state.scale,
      worldY: (midpoint.y - state.y) / state.scale,
    };
  };

  const createPinchStartFromPoints = (a: PointerInfo, b: PointerInfo): void => {
    const midpoint = {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
    };
    const distance = Math.hypot(a.x - b.x, a.y - b.y);

    pinchStart = {
      distance,
      scale: state.scale,
      worldX: (midpoint.x - state.x) / state.scale,
      worldY: (midpoint.y - state.y) / state.scale,
    };
  };

  const handlePointerDown = (event: PointerEvent): void => {
    if (touchGestureActive && event.pointerType === 'touch') return;
    preventNativeTouch(event);
    cancelAnimationFrame(animationFrame);
    stage.setPointerCapture(event.pointerId);
    const point = clientToSvg(event.clientX, event.clientY);
    pointers.set(event.pointerId, point);
    dragMoved = false;

    if (pointers.size === 1) {
      panStart = { pointer: point, state: { ...state } };
    } else if (pointers.size === 2) {
      panStart = null;
      updatePinchStart();
    }
  };

  const handlePointerMove = (event: PointerEvent): void => {
    if (touchGestureActive && event.pointerType === 'touch') return;
    if (!pointers.has(event.pointerId)) return;
    preventNativeTouch(event);

    const point = clientToSvg(event.clientX, event.clientY);
    pointers.set(event.pointerId, point);

    if (pointers.size === 1 && panStart) {
      const dx = point.x - panStart.pointer.x;
      const dy = point.y - panStart.pointer.y;
      if (Math.hypot(dx, dy) > 2) dragMoved = true;
      state = {
        ...panStart.state,
        x: panStart.state.x + dx,
        y: panStart.state.y + dy,
      };
      applyTransform();
      return;
    }

    if (pointers.size === 2 && pinchStart) {
      dragMoved = true;
      const [a, b] = [...pointers.values()];
      const midpoint = {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
      };
      const distance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
      const nextScale = clamp(
        pinchStart.scale * (distance / Math.max(1, pinchStart.distance)),
        minScale,
        maxScale,
      );

      state = {
        scale: nextScale,
        x: midpoint.x - pinchStart.worldX * nextScale,
        y: midpoint.y - pinchStart.worldY * nextScale,
      };
      applyTransform();
    }
  };

  const handlePointerEnd = (event: PointerEvent): void => {
    if (touchGestureActive && event.pointerType === 'touch') return;
    preventNativeTouch(event);
    pointers.delete(event.pointerId);
    if (stage.hasPointerCapture(event.pointerId)) {
      stage.releasePointerCapture(event.pointerId);
    }

    if (pointers.size === 1) {
      const remaining = [...pointers.values()][0];
      panStart = { pointer: remaining, state: { ...state } };
      pinchStart = null;
    } else {
      panStart = null;
      pinchStart = null;
    }

    window.setTimeout(() => {
      dragMoved = false;
    }, 0);
  };

  const handleTouchStart = (event: TouchEvent): void => {
    if (!event.touches.length) return;
    preventNativeTouch(event);
    markTouchGestureActive();
    cancelAnimationFrame(animationFrame);
    pointers.clear();
    dragMoved = false;

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const point = clientToSvg(touch.clientX, touch.clientY);
      panStart = { pointer: point, state: { ...state } };
      pinchStart = null;
      return;
    }

    const first = event.touches[0];
    const second = event.touches[1];
    panStart = null;
    createPinchStartFromPoints(
      clientToSvg(first.clientX, first.clientY),
      clientToSvg(second.clientX, second.clientY),
    );
  };

  const handleTouchMove = (event: TouchEvent): void => {
    if (!event.touches.length) return;
    preventNativeTouch(event);
    markTouchGestureActive();

    if (event.touches.length === 1 && panStart) {
      const touch = event.touches[0];
      const point = clientToSvg(touch.clientX, touch.clientY);
      const dx = point.x - panStart.pointer.x;
      const dy = point.y - panStart.pointer.y;
      if (Math.hypot(dx, dy) > 2) dragMoved = true;
      state = {
        ...panStart.state,
        x: panStart.state.x + dx,
        y: panStart.state.y + dy,
      };
      applyTransform();
      return;
    }

    if (event.touches.length >= 2) {
      const first = event.touches[0];
      const second = event.touches[1];
      const a = clientToSvg(first.clientX, first.clientY);
      const b = clientToSvg(second.clientX, second.clientY);
      if (!pinchStart) createPinchStartFromPoints(a, b);
      if (!pinchStart) return;

      dragMoved = true;
      const midpoint = {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
      };
      const distance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
      const nextScale = clamp(
        pinchStart.scale * (distance / Math.max(1, pinchStart.distance)),
        minScale,
        maxScale,
      );

      state = {
        scale: nextScale,
        x: midpoint.x - pinchStart.worldX * nextScale,
        y: midpoint.y - pinchStart.worldY * nextScale,
      };
      applyTransform();
    }
  };

  const handleTouchEnd = (event: TouchEvent): void => {
    preventNativeTouch(event);
    pointers.clear();

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const point = clientToSvg(touch.clientX, touch.clientY);
      panStart = { pointer: point, state: { ...state } };
      pinchStart = null;
      markTouchGestureActive();
    } else {
      panStart = null;
      pinchStart = null;
      releaseTouchGestureSoon();
    }

    window.setTimeout(() => {
      dragMoved = false;
    }, 0);
  };

  const handleStageClick = (event: MouseEvent): void => {
    if (event.target === svg || event.target === stage) {
      clearHighlight();
    }
  };

  const runEntryAnimation = (): void => {
    if (
      options.animateOnMount === false ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const edgeElements = [...svg.querySelectorAll<SVGLineElement>('.edge')];
    edgeElements.forEach((edge, index) => {
      const length = Math.hypot(
        edge.x2.baseVal.value - edge.x1.baseVal.value,
        edge.y2.baseVal.value - edge.y1.baseVal.value,
      );

      edge.animate(
        [
          { strokeDasharray: `${length}`, strokeDashoffset: `${length}`, opacity: 0 },
          { strokeDasharray: `${length}`, strokeDashoffset: '0', opacity: 0.76 },
        ],
        {
          duration: 480,
          delay: index * 14,
          easing: 'cubic-bezier(.2,.7,.2,1)',
          fill: 'both',
        },
      );
    });

    [...svg.querySelectorAll<SVGGElement>('.node')].forEach((node, index) => {
      node.animate(
        [
          { opacity: 0, transform: `${node.getAttribute('transform') ?? ''} scale(.82)` },
          { opacity: 1, transform: node.getAttribute('transform') ?? '' },
        ],
        {
          duration: 320,
          delay: 130 + index * 16,
          easing: 'cubic-bezier(.2,.8,.2,1)',
          fill: 'both',
        },
      );
    });
  };

  stage.addEventListener('wheel', handleWheel, { passive: false });
  stage.addEventListener('pointerdown', handlePointerDown, { passive: false });
  stage.addEventListener('pointermove', handlePointerMove, { passive: false });
  stage.addEventListener('pointerup', handlePointerEnd, { passive: false });
  stage.addEventListener('pointercancel', handlePointerEnd, { passive: false });
  stage.addEventListener('touchstart', handleTouchStart, { passive: false });
  stage.addEventListener('touchmove', handleTouchMove, { passive: false });
  stage.addEventListener('touchend', handleTouchEnd, { passive: false });
  stage.addEventListener('touchcancel', handleTouchEnd, { passive: false });
  stage.addEventListener('click', handleStageClick);
  resetButton.addEventListener('click', reset);
  svg.addEventListener('dblclick', reset);

  applyTransform();
  requestAnimationFrame(runEntryAnimation);

  return {
    reset,
    focusNode,
    destroy: (): void => {
      destroyed = true;
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(touchReleaseTimer);
      stage.removeEventListener('wheel', handleWheel);
      stage.removeEventListener('pointerdown', handlePointerDown);
      stage.removeEventListener('pointermove', handlePointerMove);
      stage.removeEventListener('pointerup', handlePointerEnd);
      stage.removeEventListener('pointercancel', handlePointerEnd);
      stage.removeEventListener('touchstart', handleTouchStart);
      stage.removeEventListener('touchmove', handleTouchMove);
      stage.removeEventListener('touchend', handleTouchEnd);
      stage.removeEventListener('touchcancel', handleTouchEnd);
      stage.removeEventListener('click', handleStageClick);
      resetButton.removeEventListener('click', reset);
      host.innerHTML = '';
      host.classList.remove('chair-tree');
    },
  };
}
