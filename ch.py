from scipy.spatial import ConvexHull
import numpy as np
import csv

if __name__ == "__main__":
    inf = open("initial_data_normalized.csv", "r")
    inf.readline()

    reader = csv.reader(inf)
    allpts = []
    for line in reader:
        nums = []
        for num in line:
            nums.append(float(num))
        allpts.append(nums)

    arr = np.array(allpts)
    print("loaded points")
    arr = arr[:1000,:]
    hull = ConvexHull(arr)
    print(hull.vertices)
    exit()