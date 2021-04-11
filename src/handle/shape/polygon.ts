/**
 * 绘制多边形
 */

import { drawCoordinate, lineType } from './index'
import { useShape } from './shape'
import { reRender } from '../handle'

let ellipseSite = 0;

const
    ellipseDash = 4,
    num = 5;

/**
 * 绘制多边形
 */
export function drawPolygon(coordinate: drawCoordinate, context: CanvasRenderingContext2D){
    reRender();
    drawPolygonFullLine(context, coordinate);
}

/**
 * 实线椭圆
 */
function drawPolygonFullLine(context: CanvasRenderingContext2D, coordinate: drawCoordinate){
    const { x, y, r } = polygonCircle(coordinate)
    const { ey, ex } = coordinate
    var i = 0
    context.beginPath();
    const unitAngle = Math.PI * 2 / num;
    let angle = 0
    // context.moveTo(x + r * Math.cos(angle),y + r * Math.sin(angle))
    for (i; i < num; i ++) {
        context.lineTo(x + r * Math.cos(angle),y + r * Math.sin(angle))
        angle += unitAngle
    }
    // var i = 1
    // context.moveTo(x + r * Math.cos(2 * Math.PI * i / num), y + r * Math.sin(2 * Math.PI * i / num))
    // for(i; i <= num; i++) {
    //     context.lineTo(x + r * Math.cos(2 * Math.PI * i / num), y + r * Math.sin(2 * Math.PI * i / num))
    // }

    context.closePath();
    context.stroke();

}

/**
 * 椭圆形填充颜色
 */
export function fillPolygon(
    context: CanvasRenderingContext2D,
    coordinate: drawCoordinate,
    color: string
){
    const { x, y, r } = polygonCircle(coordinate)
    drawPolygonFullLine(context, coordinate)
    context.beginPath()
    context.fillStyle = color
    context.fill()
    context.closePath()
}


/**
 * 求多边形的起点和外切圆的半径
 */
function polygonCircle(coordinate: drawCoordinate){

    const { sx, sy, ex, ey } = coordinate

    return {
        x: sx,
        y: sy,
        r: Math.sqrt(Math.pow(ex - sx, 2) + Math.pow(ey - sy, 2))
    }
}

/*
* 当前坐标的象限
* */
function getQuadrant(x: number, y: number){
    if(x >= 0 && y >= 0) {
        return 90
    } else if(x < 0 && y >= 0) {
        return 180
    } else if(x < 0 && y < 0) {
        return 270
    } else if(x >= 0 && y < 0) {
        return 360
    }
}