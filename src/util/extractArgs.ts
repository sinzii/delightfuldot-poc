import minimist from "minimist";

export const extractArgs = () => {
  const args = minimist(process.argv.slice(2));
  const numberOfEndpoints = parseInt(args['n']) || 10;
  const library = args['l'];
  console.log(args);

  if (!['delightfuldot', 'polkadotapi', 'delightfuldot-poc'].includes(library)) {
    throw new Error('Please select between `delighfuldot` OR `polkadotapi` via argument `l`, e.g: -l polkadotapi OR -l delightfuldot')
  }

  return {
    numberOfEndpoints,
    library
  }
}
