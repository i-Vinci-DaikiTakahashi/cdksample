export const GenerateResourceName = (systemName: string, env: string) => (sufix: string) => {
  return `${systemName}-${env}-${sufix}`;
};