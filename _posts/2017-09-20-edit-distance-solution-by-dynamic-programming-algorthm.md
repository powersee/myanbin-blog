---
layout: post
title: '求解编辑距离的动态规划算法'
tags: [code]
---

编辑距离（Edit Distance）是一种用于比较两个字符串之间相似度的计算方法，其定义为：将字符串 X 转换成字符串 Y 所需要的字符操作的最少次数，这里的操作是指插入（Insert）、删除（Delete）或替换（Substitute）。

比如，字符串 `vary` 和 `every` 的编辑距离是 2，因为可以通过以下的两步操作进行转换：

1. 在串首插入字符 `e`，得到 `evary`
2. 将字符 `a` 替换成 `e`，得到 `every`

编辑距离越小，表示两个字符串之间的相似度越大，所以常被用于单词的拼写检查或生物的 DNA 序列检测等问题上。

## 一、数学分析

对编辑距离的求解，需要用到动态规划的思想。即通过拆分，将对原问题的求解划分为对一系列相对简单的重叠子问题的求解，然后再合并这些子问题的解去一步步得到原问题的解。

设两个字符串分别为 X=X<sub>1</sub>...X<sub>i</sub>，Y=Y<sub>1</sub>...Y<sub>j</sub>，其编辑距离为 d<sub>i,j</sub>。那么可知：

1. 若在 d<sub>i,j-1</sub> 个操作内，可以将 X<sub>1</sub>...X<sub>i</sub> 转换为 Y<sub>1</sub>...Y<sub>j-1</sub>，那么必然可以在  d<sub>i,j-1</sub>+1 个操作内将 X<sub>1</sub>...X<sub>i</sub> 转换为 Y<sub>1</sub>...Y<sub>j</sub>。这里的 +1 操作表示将 Y<sub>j</sub> 插入到  Y<sub>1</sub>...Y<sub>j-1</sub> 中；

2. 若在 d<sub>i-1,j</sub> 个操作内，可以将 X<sub>1</sub>...X<sub>i-1</sub> 转换为 Y<sub>1</sub>...Y<sub>j</sub>，那么必然可以在  1+d<sub>i-1,j</sub> 个操作内将 X<sub>1</sub>...X<sub>i</sub> 转换为 Y<sub>1</sub>...Y<sub>j</sub>。这里的 +1 操作表示把 X<sub>i</sub> 从 X<sub>1</sub>...X<sub>i</sub> 中删除；

3. 若在 d<sub>i-1,j-1</sub> 个操作内，可以将 X<sub>1</sub>...X<sub>i-1</sub> 转换为 Y<sub>1</sub>...Y<sub>j-1</sub>，那么：

    * 如果 X<sub>i</sub>=Y<sub>j</sub>，则必然可在 d<sub>i-1,j-1</sub> 个操作内将 X<sub>1</sub>...X<sub>i</sub> 转换为 Y<sub>1</sub>...Y<sub>j</sub>
    * 如果 X<sub>i</sub>≠Y<sub>j</sub>，则必然可在 d<sub>i-1,j-1</sub>+1 个操作内将 X<sub>1</sub>...X<sub>i</sub> 转换为 Y<sub>1</sub>...Y<sub>j</sub>。这里的 +1 操作表示将 X<sub>i</sub> 替换为 Y<sub>j</sub>


取上面三种情形的最小值，便是字符串 X 和 Y 的最小编辑距离。

在编辑距离计算的过程中，通常采用二维矩阵来存储计算过程中子问题的解。

![编辑距离二维矩阵](https://infp.github.io/images/edit-distance.png){:.center}

最后我们可以得到如下递推公式：当 `x[i] == y[j]` 时，有：

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

下面是使用 C++ 实现的求解编辑距离的算法，其时间复杂度是 O(mn)：

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