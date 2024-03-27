import { CanvasRenderingContext2D } from 'canvas';

export namespace IShare {
  export interface RoundedRectangleOptions {
    ctx: CanvasRenderingContext2D;
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
    color: string;
  }

  export interface TextOptions {
    ctx: CanvasRenderingContext2D;
    x: number;
    y: number;
    text: string;
    font: string;
    fontSize: number;
    color: string;
    align?: 'right' | 'left' | 'center'; // Optional parameter
  }

  export interface DrawTileOptions {
    ctx: CanvasRenderingContext2D;
    x: number;
    y: number;
    width: number;
    height: number;
    title: string;
    professor: string;
    location: string;
    font: string;
    fontSize: number;
  }
}
