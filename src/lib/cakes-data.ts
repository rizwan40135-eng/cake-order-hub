export type Cake = { id: string; name: string; desc: string; base: number };

export const CAKES: Cake[] = [
  { id: "chocolate", name: "Chocolate Truffle", desc: "Dark chocolate sponge, glossy ganache drip", base: 650 },
  { id: "redvelvet", name: "Red Velvet", desc: "Cocoa-kissed sponge, cream cheese frosting", base: 750 },
  { id: "strawberry", name: "Strawberry Cream", desc: "Fresh berries, light whipped cream", base: 700 },
  { id: "vanilla", name: "Vanilla Bean", desc: "Buttercream, gold sprinkles", base: 550 },
  { id: "butterscotch", name: "Butterscotch Crunch", desc: "Caramel drip, praline crunch", base: 600 },
  { id: "blackforest", name: "Black Forest", desc: "Cherries, cream, chocolate shavings", base: 650 },
];

export const SIZES = [
  { id: "0.5", label: "½ kg", mult: 1 },
  { id: "1", label: "1 kg", mult: 1.9 },
  { id: "2", label: "2 kg", mult: 3.6 },
];
export const TYPES = [
  { id: "egg", label: "With egg", add: 0 },
  { id: "eggless", label: "Eggless", add: 50 },
];
export const SHAPES = [
  { id: "round", label: "Round", add: 0 },
  { id: "square", label: "Square", add: 0 },
  { id: "heart", label: "Heart", add: 100 },
];
export const EXTRAS = [
  { id: "candles", label: "Candles", add: 30 },
  { id: "topper", label: "Name topper", add: 150 },
  { id: "photo", label: "Photo print", add: 250 },
];

export type LineInput = {
  cakeId: string;
  size: string;
  type: string;
  shape: string;
  extras: string[];
  message: string;
  qty: number;
};

export function priceLine(l: LineInput): number {
  const cake = CAKES.find((c) => c.id === l.cakeId);
  const size = SIZES.find((s) => s.id === l.size);
  const type = TYPES.find((t) => t.id === l.type);
  const shape = SHAPES.find((s) => s.id === l.shape);
  if (!cake || !size || !type || !shape) throw new Error("Invalid option");
  const extras = l.extras.reduce((sum, id) => {
    const e = EXTRAS.find((x) => x.id === id);
    if (!e) throw new Error("Invalid extra");
    return sum + e.add;
  }, 0);
  const unit = Math.round(cake.base * size.mult) + type.add + shape.add + extras;
  return unit * l.qty;
}

export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
