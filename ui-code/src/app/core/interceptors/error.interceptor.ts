import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred!';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error (Spring Boot format)
        // Format: { "timestamp": "...", "status": 400, "error": "Bad Request", "message": "..." }
        errorMessage = error.error?.message || error.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
        
        if (error.status === 401) {
          // Handle unauthorized - e.g., redirect to login
          console.error('Unauthorized request - redirecting to login');
        } else if (error.status === 404) {
          console.error('Resource not found');
        }
      }

      console.error(errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};
