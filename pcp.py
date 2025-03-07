import plotly.express as px
import pandas as pd

if __name__ == "__main__":
    df = pd.read_csv("./initial_data.csv", sep=",",encoding="latin-1")
    

    fig = px.parallel_coordinates(df, color="Density(g/cm3)",
                dimensions = ["El.conductivity(S/m)", "El. resistivity(ohm m)", "heat capacity(J/(mol K))", "Therm. diffusivity(m2/s)", "Therm.resistivity(mK/W)"],
                             color_continuous_scale=px.colors.diverging.Tealrose,
                             color_continuous_midpoint=2, range_color=[2.6,2.8])
    
    fig.show()