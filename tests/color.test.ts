import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidHSLString, hslStringToRgb, hexToRgb, rgbToHex, rgbToHsl, rgbToCmyk, generateGrayscale, generateHuePalette, generateColorPaletteForHue } from '../src/app/utils/colorConversions';
import { ColorURLShare } from '../src/app/utils/urlShare';
import { ColorStorage } from '../src/app/utils/colorStorage';
import { ColorExporter } from '../src/app/utils/colorExport';

test('HSL input and share URLs reject out-of-range or partial values', () => {
  for (const input of ['hsl(999, 50%, 50%)', 'hsl(1, 101%, 50%)', 'hsl(1, 50%, 101%)', 'prefix hsl(1, 50%, 50%)']) assert.equal(isValidHSLString(input), false);
  for (const input of ['-50-50', '10--50', '999-50-50', '1-1-101', '1e2-50-50']) assert.equal(ColorURLShare.decodeColor(input), null);
  assert.equal(ColorURLShare.encodeColor('hsl(999, 50%, 50%)'), '');
  const color = 'hsl(180, 50%, 50%)';
  assert.equal(ColorURLShare.decodeColor(ColorURLShare.encodeColor(color)), color);
});

test('conversion preserves primaries, extremes and HEX roundtrips', () => {
  for (const hex of ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#123456', '#ABCDEF']) {
    assert.equal(rgbToHex(hexToRgb(hex)), hex);
    const source = hexToRgb(hex);
    const {h,s,l} = rgbToHsl(source);
    const back = hslStringToRgb(`hsl(${h}, ${s}%, ${l}%)`);
    for (const channel of ['r','g','b'] as const) assert.ok(Math.abs(back[channel] - source[channel]) <= 4);
  }
  assert.deepEqual(rgbToCmyk({r:0,g:0,b:0}), {c:0,m:0,y:0,k:100});
  assert.deepEqual(rgbToCmyk({r:255,g:0,b:0}), {c:0,m:100,y:100,k:0});
});

test('palettes have documented dimensions and valid values', () => {
  assert.equal(generateGrayscale().length,20);
  assert.equal(generateHuePalette().length,20);
  for (let hue=0;hue<20;hue++) {
    const colors=generateColorPaletteForHue(hue);
    assert.equal(colors.length,400);
    assert.ok(colors.every(isValidHSLString));
  }
});

test('corrupt persisted color shapes do not crash the application', () => {
  const data = new Map<string,string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable:true, value:{ getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>data.set(key,value),removeItem:(key:string)=>data.delete(key) }});
  for (const corrupt of ['{}', 'null', '[null]', '[{"color":"hsl(999, 50%, 50%)","timestamp":1}]']) {
    data.set('color-palette-favorites',corrupt);
    assert.deepEqual(ColorStorage.getFavorites(),[]);
    assert.equal(ColorStorage.isFavorite('hsl(0, 100%, 50%)'),false);
  }
  data.clear();
  assert.equal(ColorStorage.addFavorite('hsl(0, 100%, 50%)'),true);
  assert.equal(ColorStorage.addFavorite('hsl(0, 100%, 50%)'),false);
  assert.equal(ColorStorage.getFavorites().length,1);
  for (let i=0;i<25;i++) ColorStorage.addToHistory(`hsl(${i}, 50%, 50%)`);
  assert.equal(ColorStorage.getHistory().length,20);
  ColorStorage.removeFavorite('hsl(0, 100%, 50%)');
  assert.deepEqual(ColorStorage.getFavorites(),[]);
});

test('exports encode the selected color in CSS, JSON and Figma formats', () => {
  const colors=new Map([['red',{hex:'#FF0000',rgb:{r:255,g:0,b:0},hsl:{h:0,s:100,l:50},cmyk:{c:0,m:100,y:100,k:0}}]]);
  assert.match(ColorExporter.toCSS(colors),/--color-red: #FF0000;/);
  assert.equal(JSON.parse(ColorExporter.toJSON(colors)).red.hex,'#FF0000');
  assert.deepEqual(JSON.parse(ColorExporter.toFigma(colors)).colors[0].color,{r:1,g:0,b:0,a:1});
});

test('subsequent favorite and history writes preserve corrupt raw bytes', () => {
  const data=new Map<string,string>();
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>data.set(key,value),removeItem:(key:string)=>data.delete(key)}});
  for(const raw of ['{','{}','null','[null]','']) {
    data.set('color-palette-favorites',raw);
    assert.deepEqual(ColorStorage.getFavorites(),[]);
    assert.ok(ColorStorage.getStorageError());
    assert.equal(ColorStorage.addFavorite('hsl(0, 100%, 50%)'),false);
    assert.equal(ColorStorage.removeFavorite('hsl(0, 100%, 50%)'),false);
    assert.equal(data.get('color-palette-favorites'),raw);
    data.set('color-palette-history',raw);
    ColorStorage.addToHistory('hsl(0, 100%, 50%)');
    assert.equal(ColorStorage.clearHistory(),false);
    assert.equal(data.get('color-palette-history'),raw);
  }
});
