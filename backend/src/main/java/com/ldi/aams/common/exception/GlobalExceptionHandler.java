package com.ldi.aams.common.exception;

import com.ldi.aams.common.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        List<ErrorResponse.FieldError> fieldErrors = ex.getBindingResult().getAllErrors().stream()
                .map(error -> {
                    String fieldName = ((FieldError) error).getField();
                    String errorMessage = error.getDefaultMessage();
                    return ErrorResponse.FieldError.builder().field(fieldName).message(errorMessage).build();
                })
                .collect(Collectors.toList());

        ErrorResponse.ErrorDetail detail = ErrorResponse.ErrorDetail.builder()
                .code("VALIDATION_ERROR")
                .message("Validation failed")
                .details(fieldErrors)
                .build();

        return new ResponseEntity<>(ErrorResponse.builder().error(detail).build(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        ErrorResponse.ErrorDetail detail = ErrorResponse.ErrorDetail.builder()
                .code(ex.getCode() != null ? ex.getCode() : "BUSINESS_ERROR")
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(ErrorResponse.builder().error(detail).build(), HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex) {
        ErrorResponse.ErrorDetail detail = ErrorResponse.ErrorDetail.builder()
                .code("NOT_FOUND")
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(ErrorResponse.builder().error(detail).build(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedException(UnauthorizedException ex) {
        ErrorResponse.ErrorDetail detail = ErrorResponse.ErrorDetail.builder()
                .code("UNAUTHORIZED")
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(ErrorResponse.builder().error(detail).build(), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentialsException(BadCredentialsException ex) {
        ErrorResponse.ErrorDetail detail = ErrorResponse.ErrorDetail.builder()
                .code("AUTHENTICATION_ERROR")
                .message("Invalid username or password")
                .build();
        return new ResponseEntity<>(ErrorResponse.builder().error(detail).build(), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(org.springframework.security.authentication.DisabledException.class)
    public ResponseEntity<ErrorResponse> handleDisabledException(org.springframework.security.authentication.DisabledException ex) {
        ErrorResponse.ErrorDetail detail = ErrorResponse.ErrorDetail.builder()
                .code("ACCOUNT_DISABLED")
                .message("Your account has been disabled. Please contact an administrator.")
                .build();
        return new ResponseEntity<>(ErrorResponse.builder().error(detail).build(), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex) {
        ErrorResponse.ErrorDetail detail = ErrorResponse.ErrorDetail.builder()
                .code("AUTHORIZATION_ERROR")
                .message("Access is denied")
                .build();
        return new ResponseEntity<>(ErrorResponse.builder().error(detail).build(), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        log.error("Data integrity violation", ex);
        ErrorResponse.ErrorDetail detail = ErrorResponse.ErrorDetail.builder()
                .code("CONFLICT")
                .message("Data integrity violation. This could be due to a duplicate entry or invalid reference.")
                .build();
        return new ResponseEntity<>(ErrorResponse.builder().error(detail).build(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Unhandled exception", ex);
        ErrorResponse.ErrorDetail detail = ErrorResponse.ErrorDetail.builder()
                .code("INTERNAL_ERROR")
                .message("An unexpected error occurred")
                .build();
        return new ResponseEntity<>(ErrorResponse.builder().error(detail).build(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
