import { Component, JSX } from 'solid-js'
import type { Element } from 'hast'
import type { Position } from 'unist'

/**
 * @typedef {import('unist').Position} Position
 */

/* File for types which are not handled correctly in JSDoc mode */

export interface SolidMarkdownProps {
  node: Element
  children: Component[]
  /**
   * Passed when `options.rawSourcePos` is given
   */
  sourcePosition: Position
  /**
   * Passed when `options.includeElementIndex` is given
   */
  index?: number
  /**
   * Passed when `options.includeElementIndex` is given
   */
  siblingCount?: number
}

export type NormalComponents = {
  [TagName in keyof JSX.IntrinsicElements]:
    | keyof JSX.IntrinsicElements
    | Component<JSX.IntrinsicElements[TagName] & SolidMarkdownProps>
}
