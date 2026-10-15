import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
function token(name: string) {
  const value = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,6})`))?.[1]
  assert.ok(value, name)
  return value.length === 4 ? '#' + [...value.slice(1)].map(x => x + x).join('') : value
}
function luminance(hex: string) {
  const rgb = hex.slice(1).match(/../g)!.map(x => Number.parseInt(x, 16) / 255)
    .map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4)
  return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2]
}
function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((a, b) => b - a)
  return (values[0] + .05) / (values[1] + .05)
}
test('actual text/action/focus/control palette meets contrast targets', () => {
  for (const foreground of ['ink', 'muted', 'teal', 'amber']) {
    for (const background of [token('paper'), '#f7f8f4', '#edf3ee', '#fcf5e8']) {
      assert.ok(contrast(token(foreground), background) >= 4.5, `${foreground} on ${background}`)
    }
  }
  assert.ok(contrast('#ffffff', token('teal')) >= 4.5)
  assert.ok(contrast(token('control-border'), '#ffffff') >= 3)
  assert.ok(contrast(token('focus'), '#f7f8f4') >= 3)
})
