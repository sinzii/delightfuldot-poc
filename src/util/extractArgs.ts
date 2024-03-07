import minimist from "minimist";

export const extractArgs = () => {
  const args = minimist(process.argv.slice(2));
  const numberOfEndpoints = parseInt(args['n']) || 10;
  const library = args['l'];
  console.log(args);

  if (!['dedot', 'polkadotapi', 'delightfuldot-poc'].includes(library)) {
    throw new Error('Please select between `dedot`, `delightfuldot-poc` OR `polkadotapi` via argument `l`, e.g: -l polkadotapi OR -l dedot')
  }

  return {
    numberOfEndpoints,
    library
  }
}
