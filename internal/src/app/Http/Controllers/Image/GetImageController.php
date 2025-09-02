<?php

namespace App\Http\Controllers\Image;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class GetImageController extends Controller
{
    public function __invoke(Request $request, string $name)
    {

        if (str_contains($name, '..')) {
            $attemptedPath = public_path('images/' . $name);

            $resolvedPath = realpath($attemptedPath);

            return response()->json([
                'status_code' => 400,
                'message' => 'Invalid image name provided.',

                'error' => 'urldecode() error image could not be resolved '. $attemptedPath .' to '. ($resolvedPath ?: 'invalid path')
            ], 400);
        }

        $processedName = urldecode($name);

        $path = public_path('images/' . $processedName);

        if (preg_match('#/+etc/+passwd#', $path)) {
            return response()->json([
                'status_code' => 403, 
                'message' => 'Access to this resource is restricted by a security policy.'
            ], 403);
        }

        if (!File::exists($path)) {
            return response()->json([
                'status_code' => 404,
                'message' => 'Image not found.'
            ], 404);
        }

        try {
            $fileContents = File::get($path);
            $base64Image = base64_encode($fileContents);
            $mimeType = File::mimeType($path);
            $dataUri = 'data:' . $mimeType . ';base64,' . $base64Image;

            return response()->json([
                'status_code' => 200,
                'message' => 'Image retrieved successfully.',
                'data' => [
                    'filename' => $processedName,
                    'mime_type' => $mimeType,
                    'data_uri' => $dataUri,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'An error occurred while processing the image.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}