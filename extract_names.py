import csv

if __name__ == "__main__":
    inf = open("initial_data.csv","r")
    outf = open("lines.txt","w")
    header = inf.readline()
    header = header.split(",")
    for i in range(len(header)):
        outf.write(f"{header[i]},{i}\n")