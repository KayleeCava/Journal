<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Convert an authentication exception into a response.
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        return $request->expectsJson() || $request->is('api/*')
            ? response()->json([
                'status_code' => 401,
                'message' => 'Unauthenticated',
                'error' => 'Token is invalid or missing'
            ], 401)
            : redirect()->guest($exception->redirectTo() ?? route('login'));
    }

    public function render($request, Throwable $exception)
    {
        if ($request->expectsJson() || $request->is('api/*')) {

            // Authentication Exception (Invalid/Missing Token)
            if ($exception instanceof AuthenticationException) {
                return response()->json([
                    'status_code' => 401,
                    'message' => 'Unauthenticated',
                    'error' => 'Token is invalid, expired, or missing'
                ], 401);
            }

            // Authorization Exception (Insufficient Permissions)
            if ($exception instanceof AuthorizationException) {
                return response()->json([
                    'status_code' => 403,
                    'message' => 'Forbidden',
                    'error' => 'You do not have permission to access this resource'
                ], 403);
            }

            // Validation Exception
            if ($exception instanceof ValidationException) {
                return response()->json([
                    'status_code' => 422,
                    'message' => 'Validation failed',
                    'errors' => $exception->errors(),
                ], 422);
            }

            // Model Not Found Exception
            if ($exception instanceof ModelNotFoundException) {
                return response()->json([
                    'status_code' => 404,
                    'message' => 'Resource not found',
                    'error' => 'The requested resource does not exist'
                ], 404);
            }

            // Route Not Found Exception
            if ($exception instanceof NotFoundHttpException) {
                return response()->json([
                    'status_code' => 404,
                    'message' => 'Endpoint not found',
                    'error' => 'The requested endpoint does not exist'
                ], 404);
            }

            // Method Not Allowed Exception
            if ($exception instanceof MethodNotAllowedHttpException) {
                return response()->json([
                    'status_code' => 405,
                    'message' => 'Method not allowed',
                    'error' => 'The HTTP method is not supported for this endpoint'
                ], 405);
            }

            // Rate Limiting Exception
            if ($exception instanceof ThrottleRequestsException) {
                return response()->json([
                    'status_code' => 429,
                    'message' => 'Too many requests',
                    'error' => 'Rate limit exceeded. Please try again later.'
                ], 429);
            }

            $message = 'Internal server error';
            $debug = [];

            if (config('app.debug')) {
                $debug = [
                    'exception' => get_class($exception),
                    'message' => $exception->getMessage(),
                    'file' => $exception->getFile(),
                    'line' => $exception->getLine(),
                    'trace' => $exception->getTraceAsString()
                ];
            }

            return response()->json(array_filter([
                'status_code' => 500,
                'message' => $message,
                'error' => 'An unexpected error occurred',
                'debug' => !empty($debug) ? $debug : null
            ]), 500);
        }

        return parent::render($request, $exception);
    }
}
