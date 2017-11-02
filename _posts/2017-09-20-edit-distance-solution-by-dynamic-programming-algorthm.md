---
layout: post
title: '如何用动态规划算法求解「编辑距离」'
tags: [code]
---

编辑距离是一种用于比较两个字符串之间相似度的计算方法，其定义为：将字符串 X 转换成字符串 Y 所需要的字符操作的最少次数，这里的操作是指插入（Insert）、删除（Delete）或替换（Substitute）。

比如，字符串 `vary` 和 `every` 的编辑距离是 2，因为可以通过以下的两步操作进行转换：

1. 在串首插入字符 `e`，得到 `evary`
2. 将字符 `a` 替换成 `e`，得到 `every`

编辑距离越小，表示两个字符串之间的相似度越大，所以常被用于单词的拼写检查或生物的 DNA 序列检测等问题上。

## 一、数学分析

对编辑距离的求解，需要用到动态规划的思想。即通过拆分，将对原问题的求解划分为对一系列相对简单的重叠子问题的求解，然后再合并这些子问题的解去一步步得到原问题的解。

设两个字符串分别为 $X = X_1 \cdots X_i$，$Y = Y_1 \cdots Y_j$，其编辑距离为 $d_{i,j}$。那么可知：

1. 若在 $d_{i,j-1}$ 个操作内，可以将 $X_1 \cdots X_i$ 转换为 $Y_1 \cdots Y_{j-1}$，那么必然可以在 $d_{i,j-1} + 1$ 个操作内将 $X_1 \cdots X_i$ 转换为 $Y_1 \cdots Y_j$。这里的 $+1$ 操作表示将 $Y_j$ 插入到 $Y_1 \cdots Y_{j-1}$ 中；

2. 若在 $d_{i-1,j}$ 个操作内，可以将 $X = X_1 \cdots X_{i-1}$ 转换为 $Y_1 \cdots Y_j$，那么必然可以在 $d_{i-1,j} + 1$ 个操作内将 $X_1 \cdots X_i$ 转换为 $Y_1 \cdots Y_j$。这里的 $+1$ 操作表示把 $X_i$ 从 $X = X_1 \cdots X_i$ 中删除；

3. 若在 $d_{i-1,j-1}$ 个操作内，可以将 $X = X_1 \cdots X_{i-1}$ 转换为 $Y_1 \cdots Y_{j-1}$，那么：

    * 如果 $X_i = Y_j$，则必然可在 $d_{i-1,j-1}$ 个操作内将  $X = X_1 \cdots X_i$ 转换为 $Y_1 \cdots Y_j$
    * 如果 $X_i \not = Y_j$，则必然可在 $d_{i-1,j-1} + 1$ 个操作内将 $X = X_1 \cdots X_i$ 转换为 $Y_1 \cdots Y_j$。这里的 $+1$ 操作表示将 $X_i$ 替换为 $Y_j$


取上面三种情形的最小值，便是字符串 $X$ 和 $Y$ 的最小编辑距离：


![编辑距离递推公式]({{site.img_url}}/edit-distance-formulation.png){:.center}

在编辑距离计算的过程中，通常采用二维矩阵来存储计算过程中子问题的解。

![编辑距离二维矩阵]({{site.img_url}}/edit-distance.png){:.center}

由以上分析，我们可以得知，当 `x[i] == y[j]` 时，有：

```cpp
dp[i][j] = min(dp[i][j-1] + 1, dp[i-1][j] + 1, dp[i-1][j-1])
```

当 `x[i] ！= y[j]` 时，有：

```cpp
dp[i][j] = min(p[i][j-1] + 1, dp[i-1][j] + 1, dp[i-1][j-1] + 1)
```

当 `x` 或 `y` 为空串时，有：

```cpp
dp[0][j] = j, dp[i][0] = i
```

## 二、代码实现

下面是使用 C++ 实现的求解编辑距离的算法，其时间复杂度是 $$O(mn)$$：

```cpp
public class Solution {
    public int distance(String src, String dest) {
        int m = src.length(), n = dest.length();
        int[][] dp = new int[m+1][n+1];
        // 初始化空字符串的情况
        for (int i = 1; i <= m; i++) {
            dp[i][0] = i;
        }
        for (int j = 1; j <= n; j++) {
            dp[0][j] = j;
        }
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                int insertion = dp[i][j-1] + 1;
                int deletion = dp[i-1][j] + 1;
                int substitution = dp[i-1][j-1] + (src.charAt(i - 1) == dest.charAt(j - 1) ? 0 : 1);
                dp[i][j] = Math.min(substitution, Math.min(insertion, deletion));
            }
        }
        return dp[m][n];
    }
}
```

## 三、参考资料

* [Edit distance From Wikipedia](https://en.wikipedia.org/wiki/Edit_distance)
* [编辑距离算法](http://www.cnblogs.com/sheeva/p/6598449.html)