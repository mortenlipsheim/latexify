
import type { SymbolCategory } from './types';

export const SYMBOL_CATEGORIES: SymbolCategory[] = [
  {
    name: 'Basic',
    symbols: [
      { name: 'Fraction', latex: '\\frac{}{}', type: 'template', description: 'Insert fraction' },
      { name: 'Power', latex: '^{}', type: 'template', description: 'Insert superscript (power)' },
      { name: 'Subscript', latex: '_{}', type: 'template', description: 'Insert subscript' },
      { name: 'Square Root', latex: '\\sqrt{}', type: 'template', description: 'Insert square root' },
      { name: 'Nth Root', latex: '\\sqrt[]{}', type: 'template', description: 'Insert nth root' },
    ],
  },
  {
    name: 'Sums & Integrals',
    symbols: [
      { name: 'Sum', latex: '\\sum_{i=0}^{n}', type: 'template', description: 'Insert summation symbol' },
      { name: 'Product', latex: '\\prod_{i=0}^{n}', type: 'template', description: 'Insert product symbol' },
      { name: 'Integral', latex: '\\int_{a}^{b}', type: 'template', description: 'Insert integral symbol' },
      { name: 'Double Integral', latex: '\\iint_{D}', type: 'template', description: 'Insert double integral' },
      { name: 'Triple Integral', latex: '\\iiint_{V}', type: 'template', description: 'Insert triple integral' },
      { name: 'Contour Integral', latex: '\\oint_{C}', type: 'template', description: 'Insert contour integral' },
      { name: 'Limit', latex: '\\lim_{x \\to a}', type: 'template', description: 'Insert limit' },
    ]
  },
  {
    name: 'Greek Letters',
    symbols: [
      { name: 'alpha', latex: '\\alpha', type: 'symbol' }, { name: 'beta', latex: '\\beta', type: 'symbol' },
      { name: 'gamma', latex: '\\gamma', type: 'symbol' }, { name: 'delta', latex: '\\delta', type: 'symbol' },
      { name: 'epsilon', latex: '\\epsilon', type: 'symbol' }, { name: 'zeta', latex: '\\zeta', type: 'symbol' },
      { name: 'eta', latex: '\\eta', type: 'symbol' }, { name: 'theta', latex: '\\theta', type: 'symbol' },
      { name: 'iota', latex: '\\iota', type: 'symbol' }, { name: 'kappa', latex: '\\kappa', type: 'symbol' },
      { name: 'lambda', latex: '\\lambda', type: 'symbol' }, { name: 'mu', latex: '\\mu', type: 'symbol' },
      { name: 'nu', latex: '\\nu', type: 'symbol' }, { name: 'xi', latex: '\\xi', type: 'symbol' },
      { name: 'omicron', latex: '\\omicron', type: 'symbol' }, { name: 'pi', latex: '\\pi', type: 'symbol' },
      { name: 'rho', latex: '\\rho', type: 'symbol' }, { name: 'sigma', latex: '\\sigma', type: 'symbol' },
      { name: 'tau', latex: '\\tau', type: 'symbol' }, { name: 'upsilon', latex: '\\upsilon', type: 'symbol' },
      { name: 'phi', latex: '\\phi', type: 'symbol' }, { name: 'chi', latex: '\\chi', type: 'symbol' },
      { name: 'psi', latex: '\\psi', type: 'symbol' }, { name: 'omega', latex: '\\omega', type: 'symbol' },
      { name: 'Gamma (Cap)', latex: '\\Gamma', type: 'symbol' }, { name: 'Delta (Cap)', latex: '\\Delta', type: 'symbol' },
      { name: 'Theta (Cap)', latex: '\\Theta', type: 'symbol' }, { name: 'Lambda (Cap)', latex: '\\Lambda', type: 'symbol' },
      { name: 'Xi (Cap)', latex: '\\Xi', type: 'symbol' }, { name: 'Pi (Cap)', latex: '\\Pi', type: 'symbol' },
      { name: 'Sigma (Cap)', latex: '\\Sigma', type: 'symbol' }, { name: 'Phi (Cap)', latex: '\\Phi', type: 'symbol' },
      { name: 'Psi (Cap)', latex: '\\Psi', type: 'symbol' }, { name: 'Omega (Cap)', latex: '\\Omega', type: 'symbol' },
    ],
  },
  {
    name: 'Operators',
    symbols: [
      { name: 'Times', latex: '\\times', type: 'symbol' }, { name: 'Divide', latex: '\\div', type: 'symbol' },
      { name: 'Dot Product', latex: '\\cdot', type: 'symbol' }, { name: 'Plus/Minus', latex: '\\pm', type: 'symbol' },
      { name: 'Minus/Plus', latex: '\\mp', type: 'symbol' },
      { name: 'Not Equal', latex: '\\neq', type: 'symbol' }, { name: 'Less/Equal', latex: '\\leq', type: 'symbol' },
      { name: 'Greater/Equal', latex: '\\geq', type: 'symbol' }, { name: 'Approx', latex: '\\approx', type: 'symbol' },
      { name: 'Proportional To', latex: '\\propto', type: 'symbol' }, { name: 'Infinity', latex: '\\infty', type: 'symbol' },
      { name: 'Partial Derivative', latex: '\\partial', type: 'symbol' }, { name: 'Nabla (Del)', latex: '\\nabla', type: 'symbol' },
      { name: 'Angle', latex: '\\angle', type: 'symbol' }, { name: 'Perpendicular', latex: '\\perp', type: 'symbol' },
      { name: 'Parallel', latex: '\\parallel', type: 'symbol' },
      { name: 'Belongs To', latex: '\\in', type: 'symbol' }, { name: 'Not Belongs To', latex: '\\notin', type: 'symbol' },
      { name: 'Subset', latex: '\\subset', type: 'symbol' }, { name: 'Superset', latex: '\\supset', type: 'symbol' },
      { name: 'Union', latex: '\\cup', type: 'symbol' }, { name: 'Intersection', latex: '\\cap', type: 'symbol' },
    ],
  },
  {
    name: 'Arrows',
    symbols: [
      { name: 'Left Arrow', latex: '\\leftarrow', type: 'symbol' }, { name: 'Right Arrow', latex: '\\rightarrow', type: 'symbol' },
      { name: 'Up Arrow', latex: '\\uparrow', type: 'symbol' }, { name: 'Down Arrow', latex: '\\downarrow', type: 'symbol' },
      { name: 'Left/Right Arrow', latex: '\\leftrightarrow', type: 'symbol' },
      { name: 'Long Left Arrow', latex: '\\longleftarrow', type: 'symbol' }, { name: 'Long Right Arrow', latex: '\\longrightarrow', type: 'symbol' },
      { name: 'Maps To', latex: '\\mapsto', type: 'symbol' },
    ],
  },
  {
    name: 'Brackets & Accents',
    symbols: [
      { name: 'Parentheses', latex: '()', type: 'template', description: '(x)' },
      { name: 'Square Brackets', latex: '[]', type: 'template', description: '[x]' },
      { name: 'Curly Braces', latex: '\\{\\}', type: 'template', description: '\\{x\\}' },
      { name: 'Angle Brackets', latex: '\\langle \\rangle', type: 'template', description: '\\langle x \\rangle' },
      { name: 'Absolute Value', latex: '| |', type: 'template', description: '|x|' },
      { name: 'Hat', latex: '\\hat{}', type: 'template', description: '\\hat{a}' },
      { name: 'Bar', latex: '\\bar{}', type: 'template', description: '\\bar{x}' },
      { name: 'Dot', latex: '\\dot{}', type: 'template', description: '\\dot{x}' },
      { name: 'Double Dot', latex: '\\ddot{}', type: 'template', description: '\\ddot{x}' },
      { name: 'Vector', latex: '\\vec{}', type: 'template', description: '\\vec{v}' },
    ],
  },
  {
    name: 'Matrices',
    symbols: [
        { name: 'Matrix (Paren)', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', type: 'template'},
        { name: 'Matrix (Bracket)', latex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}', type: 'template'},
        { name: 'Matrix (Brace)', latex: '\\begin{Bmatrix} a & b \\\\ c & d \\end{Bmatrix}', type: 'template'},
        { name: 'Determinant', latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', type: 'template'},
        { name: 'Ellipsis (Horiz)', latex: '\\cdots', type: 'symbol'},
        { name: 'Ellipsis (Vert)', latex: '\\vdots', type: 'symbol'},
        { name: 'Ellipsis (Diag)', latex: '\\ddots', type: 'symbol'},
    ]
  }
];
    