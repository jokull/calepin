# -*- coding: utf-8 -*-

from functools import partial, wraps

def decorator_consumes_kwargs(decorator):
    
    """
    Decorator decorator to swallow kwargs until args are passed.
    
        >>> @decorator_consumes_kwargs
        ... def attrs(func, **kwargs):
        ...     for attr, value in kwargs.items():
        ...         setattr(func, attr, value)
        ...     return func
        >>> @attrs(a=1, b=2, c=3)
        ... def func():
        ...     pass
        >>> func.a
        1
        >>> func.b
        2
        >>> func.c
        3
    
    """
    
    @wraps(decorator)
    def wrapper(*args, **kwargs):
        if args:
            return decorator(*args, **kwargs)
        return partial(decorator, **kwargs)
    return wrapper

@decorator_consumes_kwargs
def cached_property(method, format='_cached_%s'):
    
    """
    Specify a property that is computed once, then cached indefinitely.
    
        >>> class X(object):
        ...     @cached_property
        ...     def attr(self):
        ...         print 'computing'
        ...         return 1
        >>> x = X()
        >>> x._cached_attr
        Traceback (most recent call last):
        ...
        AttributeError: 'X' object has no attribute '_cached_attr'
        >>> x.attr
        computing
        1
        >>> x._cached_attr
        1
        >>> x.attr
        1
        >>> x.attr
        1
    
    You can also give a format for the caching attribute:
    
        >>> class X(object):
        ...     @cached_property(format='%s_cache')
        ...     def attr(self):
        ...         print 'computing'
        ...         return 1
        >>> x = X()
        >>> x.attr
        computing
        1
        >>> x.attr_cache
        1
    
    """
    
    @wraps(method)
    def wrapper(self):
        attr = format % (method.__name__,)
        if hasattr(self, attr):
            return getattr(self, attr)
        value = method(self)
        setattr(self, attr, value)
        return value
    
    return property(wrapper)

