import { HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { environment } from '../environments/environment';

export const developmentNetworkGuard: HttpInterceptorFn = (request, next) => {
    if (!environment.devMode) {
        return next(request);
    }

    return throwError(() => new Error(
        `Blocked network request in development mode: ${request.method} ${request.url}`
    ));
};