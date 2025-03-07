import pandas as pd
import matplotlib.pyplot as plt
from pandas.plotting import scatter_matrix


# Load your dataset
df = pd.read_csv('initial_data.csv')

# Manually select a subset of columns (e.g., 3 inputs and 3 outputs)
selected_columns = ['Vf_AL6MN', 'Vf_AL3NI2', 'Vf_AL3NI_D011', 'El.conductivity(S/m)', 'El. resistivity(ohm m)', 'heat capacity(J/(mol K))']
subset_df = df[selected_columns]

sampled_df = subset_df.sample(n=1000, random_state=42)
# Create the scatter plot matrix
scatter_matrix(sampled_df, figsize=(20, 20), diagonal='hist',s=10)



plt.suptitle('Scatter Plot Matrix for Selected Features')
plt.savefig('scatter_plot.png')
# plt.show()