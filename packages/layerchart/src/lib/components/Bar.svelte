<script lang="ts">
  import { type ComponentProps } from 'svelte';

  import { chartContext } from './ChartContext.svelte';
  import Rect from './Rect.svelte';
  import Spline from './Spline.svelte';

  import { getRenderContext } from './Chart.svelte';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { createDimensionGetter, type Insets } from '../utils/rect.js';
  import { isScaleBand } from '../utils/scales.js';
  import { accessor, type Accessor } from '../utils/common.js';
  import { greatestAbs } from '@layerstack/utils';

  const { x: xContext, y: yContext, xScale } = chartContext();

  export let bar: Object;

  /**
   * Override `x` from context.  Useful for multiple Bar instances
   */
  export let x: Accessor = $xContext;

  /**
   * Override `y` from context.  Useful for multiple Bar instances
   */
  export let y: Accessor = $yContext;

  /**
   * Override `x1` from context.  Useful for multiple Bar instances
   */
  export let x1: Accessor = undefined;

  /**
   * Override `y1` from context.  Useful for multiple Bar instances
   */
  export let y1: Accessor = undefined;

  export let fill: string | undefined = undefined;
  export let stroke = 'black';
  export let strokeWidth = 0;
  export let radius = 0;

  /** Control which corners are rounded with radius.  Uses <path> instead of <rect> when not set to `all` */
  export let rounded:
    | 'all'
    | 'none'
    | 'edge'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right' = 'all';

  export let insets: Insets | undefined = undefined;

  export let onclick: ((e: MouseEvent) => void) | undefined = undefined;
  export let onpointerenter: ((e: PointerEvent) => void) | undefined = undefined;
  export let onpointermove: ((e: PointerEvent) => void) | undefined = undefined;
  export let onpointerleave: ((e: PointerEvent) => void) | undefined = undefined;

  export let spring: ComponentProps<Rect>['spring'] = undefined;
  export let tweened: ComponentProps<Rect>['tweened'] = undefined;

  $: if (stroke === null || stroke === undefined) stroke = 'black';

  $: getDimensions = createDimensionGetter(chartContext(), {
    x,
    y,
    x1,
    y1,
    insets,
  });
  $: dimensions = $getDimensions(bar) ?? { x: 0, y: 0, width: 0, height: 0 };

  $: isVertical = isScaleBand($xScale);
  $: valueAccessor = accessor(isVertical ? y : x);
  $: value = valueAccessor(bar);
  $: resolvedValue = Array.isArray(value) ? greatestAbs(value) : value;

  // Resolved `rounded="edge"` based on orientation and value
  $: _rounded =
    rounded === 'edge'
      ? isVertical
        ? resolvedValue >= 0
          ? 'top'
          : 'bottom'
        : resolvedValue >= 0
          ? 'right'
          : 'left'
      : rounded;

  $: topLeft = ['all', 'top', 'left', 'top-left'].includes(_rounded);
  $: topRight = ['all', 'top', 'right', 'top-right'].includes(_rounded);
  $: bottomLeft = ['all', 'bottom', 'left', 'bottom-left'].includes(_rounded);
  $: bottomRight = ['all', 'bottom', 'right', 'bottom-right'].includes(_rounded);

  $: width = dimensions.width;
  $: height = dimensions.height;
  $: diameter = 2 * radius;

  $: pathData = `M${dimensions.x + radius},${dimensions.y} h${width - diameter}
      ${topRight ? `a${radius},${radius} 0 0 1 ${radius},${radius}` : `h${radius}v${radius}`}
      v${height - diameter}
      ${bottomRight ? `a${radius},${radius} 0 0 1 ${-radius},${radius}` : `v${radius}h${-radius}`}
      h${diameter - width}
      ${bottomLeft ? `a${radius},${radius} 0 0 1 ${-radius},${-radius}` : `h${-radius}v${-radius}`}
      v${diameter - height}
      ${topLeft ? `a${radius},${radius} 0 0 1 ${radius},${-radius}` : `v${-radius}h${radius}`}
      z`
    .split('\n')
    .join('');

  const renderContext = getRenderContext();
  const canvasContext = getCanvasContext();
</script>

{#if _rounded === 'all' || _rounded === 'none' || radius === 0}
  <Rect
    {fill}
    {spring}
    {tweened}
    {stroke}
    {strokeWidth}
    rx={_rounded === 'none' ? 0 : radius}
    {onclick}
    {onpointerenter}
    {onpointermove}
    {onpointerleave}
    on:touchmove
    {...dimensions}
    {...$$restProps}
  />
{:else}
  <Spline
    {pathData}
    {fill}
    {spring}
    {tweened}
    {stroke}
    {strokeWidth}
    {onclick}
    {onpointerenter}
    {onpointermove}
    {onpointerleave}
    on:touchmove
    {...$$restProps}
  />
{/if}
