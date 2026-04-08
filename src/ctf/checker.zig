/// Build with: zig build-exe checker.zig -target wasm32-freestanding -fno-entry --export=check_flag -O ReleaseSmall
export fn check_flag(input: [*]u8, length: usize) bool {
    if (!check_input(input)) return false;

    var hash_input: [32]u8 = undefined;
    std.crypto.hash.sha2.Sha256.hash(input[0..length], &hash_input, .{});

    const result = std.mem.eql(u8, hash_input[0..], hash_flag[0..]);

    if (result) show_prize(input);

    return result;
}

noinline fn check_input(input: [*]u8) bool {
    var result = true;
    var i: u32 = 0;
    for (crc) |n| {
        var code = n;
        while (code > 0) : (code >>= 8) {
            const id = code & 0xff;
            if (input[@intCast(id)] != input[32 * 9 + i]) result = false; // Don't return early
            input[420 - 32 - 1 + i] = input[@intCast(id)];
            i += 1;
        }
    }
    return result;
}

fn show_prize(input: [*]u8) void {
    var i: u32 = 0;
    for (prize) |n| {
        var code = n;
        while (code > 0) : (code >>= 8) {
            const id = code & 0xff;
            input[32 * 10 + 1 + i] = input[@intCast(id)];
            i += 1;
        }
    }
}

// The sha256sum of the combined flags.
const hash_flag: [32]u8 = .{
    0xfb, 0xc6, 0xe9, 0x30, 0x30, 0xec, 0xc5, 0x1c, 0x56, 0x92, 0x9b, 0xfd, 0x93, 0xc1, 0x87, 0xc6,
    0x44, 0xb7, 0x5a, 0x82, 0x06, 0xe6, 0x96, 0x6b, 0xbd, 0xc1, 0xd9, 0x71, 0x11, 0x76, 0x26, 0xa6,
};

// Indexes of characters rm9 from the combined flags.
const crc: [4]u64 = .{ 0x4565a0dce3052442, 0x6380bfc208215d70, 0xa0dce3056f87a4c3, 0xfe3f416790b1c1e1 };

const prize: [4]u64 = .{ 0x421516f90a7cbe6, 0x103d4e6093a3c3f1, 0x420556585abd9e6, 0x3f5565a0d2ea142f };

const std = @import("std");
