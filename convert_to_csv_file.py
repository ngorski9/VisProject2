import pandas as pd

# Define file paths
input_txt_file = "initial_data.txt"  # Replace with your actual file path
output_csv_file = "initial_data.csv"  # Replace with your desired output file name

# with open(input_txt_file, "rb") as f:
#     raw_data = f.read(10000)  # Read the first 10,000 bytes
#     result = chardet.detect(raw_data)
#     detected_encoding = result["encoding"]

# Read the tab-separated text file
df = pd.read_csv(input_txt_file, sep="\t",encoding="latin-1")
df_cleaned = df.dropna(axis=1)

# Save it as a CSV file
df_cleaned.to_csv(output_csv_file, index=False)

print(f"Conversion completed: {output_csv_file}")