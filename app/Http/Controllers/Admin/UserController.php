<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\User\StoreUserRequest;
use App\Http\Requests\Admin\User\UpdateUserRequest;
use App\Services\UserService;
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
        $this->userService->createUser($data);

        return redirect()->route('admin.users.index')
            ->with('success', 'Data pengguna baru telah berhasil disimpan ke dalam sistem.');
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
        $this->userService->updateUser($id, $data);

        return redirect()->route('admin.users.index')
            ->with('success', 'Data pengguna telah berhasil diperbarui di dalam sistem.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id)
    {
        $this->userService->deleteUser($id);

        return redirect()->route('admin.users.index')
            ->with('success', 'Data pengguna telah berhasil dihapus dari dalam sistem.');
    }
}
