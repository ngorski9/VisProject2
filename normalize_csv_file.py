import csv

if __name__ == "__main__":
    inf = open("initial_data.csv", "r")
    header = inf.readline()
    cols = header.count(",")+1

    mins = [float('inf')] * cols
    maxs = [-float('inf')] * cols

    reader = csv.reader(inf)

    for line in reader:
        for i in range(len(line)):
            val = float(line[i])
            if val < mins[i]:
                mins[i] = val
            if val > maxs[i]:
                maxs[i] = val
    
    inf.close()

    inf = open("initial_data.csv", "r")
    outf = open("initial_data_normalized.csv", "w")

    outf.write(inf.readline())

    reader = csv.reader(inf)
    writer = csv.writer(outf)

    for line in reader:
        for i in range(len(line)):
            line[i] = round((float(line[i]) - mins[i]) / (maxs[i] - mins[i]),4)
        writer.writerow(line)
    
    inf.close()
    outf.close()