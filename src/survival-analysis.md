# Survival Analysis

## Numerical Operation

Numerical operation is a class that encapsulates RXJS Subjects and Objects. The purpose of this abstraction is to all allow the template of the target component to easily access the (partial) result and the status of the Numerical Operation. An instance of Numerical Operation is constructed from input data and a callback, or by a parent Numerical Operation and a callback.

## Callback

The callback is a function that takes as argument either the input data or the result of the parent Numerical Operation. A callback should implement a numerical method.

## Numerical methods

These are numerical-analysis function used in statistical features, such as survival analysis. The returns the numerical result or an error string. So multiple numerical operations can be organized in an array, and if one method finds an exception, it does not throw an error for the whole array of numerical methods, it displays it nicely and with permanent reference to the possible reasons why the exception occurs.

In this context, an exception is made of valid data that do not satisfy some hypotheses of the underlying statistical model.

For instance, a set of event that holds no event of interest in survival analysis is an "exception" and would lead to a non-invertible matrix.
