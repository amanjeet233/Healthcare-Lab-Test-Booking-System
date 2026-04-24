package com.healthcare.labtestbooking.audit;

import java.lang.annotation.*;

/**
 * Annotation to mark methods for audit logging
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Auditable {
    String action() default "";
}
