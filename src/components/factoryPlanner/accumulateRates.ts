import { SavedFactory } from "./FactoryPlanner";

export interface RateBalance {
  rateFromOtherClusters: number;
  product: string;
  rate: number;
}
export const accumulateRates = (
  savedFactories: SavedFactory[][]
): RateBalance[][] => {
  const ratesPerCluster = savedFactories.map((cluster) => {
    const accumulatedRates = new Map<string, number>();
    const accumulate = (product: string, rate: number) => {
      const existing = accumulatedRates.get(product);
      accumulatedRates.set(product, (existing ?? 0) + rate);
    };
    for (const factory of cluster) {
      accumulate(factory.productToProduce, factory.wantedOutputRate);
      for (const input of factory.input) {
        accumulate(input.product, -input.rate);
      }
    }
    const sortedRates = [...accumulatedRates.entries()].sort(
      (a, b) => a[1] - b[1]
    );
    return sortedRates.map((x) => ({ product: x[0], rate: x[1] }));
  });
  return ratesPerCluster.map((cluster, i) =>
    cluster.map((productRate) => {
      const rateFromOtherClusters = ratesPerCluster
        .filter((_, j) => j !== i)
        .reduce((acc, cluster) => {
          const otherFactory = cluster.find(
            (x) => x.product === productRate.product
          );
          return otherFactory ? acc + otherFactory.rate : acc;
        }, 0);
      return { ...productRate, rateFromOtherClusters };
    })
  );
};
