# import matplotlib.pyplot as plt
import pandas as pd

df = pd.read_csv("data/final.csv")

def mean(df):
    total = df.eval("male+female").sum()
    df["m %"] = df["male"]/total * 100
    df["f %"] = df["female"]/total * 100
    return df


# fig, ax = plt.subplots()
# ax.barh(df['age'], df['male'])
print(mean(df))

# plt.show()
