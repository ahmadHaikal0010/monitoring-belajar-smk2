<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\User\StoreUserRequest;
use App\Http\Requests\Admin\User\UpdateUserRequest;
use App\Services\UserService;
use Exception;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class UserController extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $filters = request()->only(['search', 'sort', 'direction']);
        $users = $this->userService->getUserList($filters);

        return Inertia::render('Admin/Users/index', [
            'users' => $users,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Users/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();

        try {
            $this->userService->createUser($data);

            return redirect()->route('admin.users.index')
                ->with('success', 'Data pengguna baru telah berhasil disimpan ke dalam sistem.');
        } catch (Exception $e) {
            Log::error('Error creating user: '.$e->getMessage());

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat menyimpan data pengguna baru. Silakan coba lagi.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $user = $this->userService->findUser($id);

        return Inertia::render('Admin/Users/show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(int $id)
    {
        $user = $this->userService->findUser($id);

        return Inertia::render('Admin/Users/edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, int $id)
    {
        $data = $request->validated();

        try {
            $this->userService->updateUser($id, $data);

            return redirect()->route('admin.users.index')
                ->with('success', 'Data pengguna telah berhasil diperbarui di dalam sistem.');
        } catch (Exception $e) {
            Log::error('Error updating user: '.$e->getMessage());

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat memperbarui data pengguna. Silakan coba lagi.');
        }

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id)
    {
        if (auth()->id() === $id) {
            abort(403);
        }

        try {
            $this->userService->deleteUser($id);

            return redirect()->route('admin.users.index')
                ->with('success', 'Data pengguna telah berhasil dihapus dari dalam sistem.');
        } catch (Exception $e) {
            Log::error('Error deleting user: '.$e->getMessage());

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat menghapus data pengguna. Silakan coba lagi.');
        }
    }

    public function approval()
    {
        $filters = request()->only(['search', 'sort', 'direction']);
        $filters['status'] = 'pending';
        $users = $this->userService->getUserList($filters);

        return Inertia::render('Admin/Users/approval', [
            'users' => $users,
            'filters' => $filters,
        ]);
    }

    public function approve(int $id)
    {
        $this->userService->approveUser($id);

        return redirect()->route('admin.users.approval')
            ->with('success', 'Pengguna telah berhasil disetujui dan diaktifkan di dalam sistem.');
    }
}
