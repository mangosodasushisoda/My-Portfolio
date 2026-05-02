#![no_std]
#![no_main]

use core::panic::PanicInfo;

#[no_mangle]
pub extern "C" fn _start() -> ! {
    let vga_ptr = 0xb8000 as *mut u8;
    let mut cursor: isize = 0;
    
    let mut c1 = 0u8; 
    let mut c2 = 0u8; 
    let mut count = 0;

    // 1. 画面クリア
    unsafe {
        for i in 0..(80 * 25) {
            *vga_ptr.offset(i * 2) = b' ';
            *vga_ptr.offset(i * 2 + 1) = 0x07;
        }
    }

    let mut last_scancode = 0;

    loop {
        if unsafe { inb(0x64) } & 1 == 1 {
            let scancode = unsafe { inb(0x60) };

            if scancode < 0x80 && scancode != last_scancode {
                let character = match scancode {
                    0x1e => b'A', 0x30 => b'B', 0x2e => b'C', 0x20 => b'D',
                    0x12 => b'E', 0x21 => b'F', 0x22 => b'G', 0x23 => b'H',
                    0x17 => b'I', 0x24 => b'J', 0x25 => b'K', 0x26 => b'L',
                    0x32 => b'M', 0x31 => b'N', 0x18 => b'O', 0x19 => b'P',
                    0x10 => b'Q', 0x13 => b'R', 0x1f => b'S', 0x14 => b'T',
                    0x16 => b'U', 0x2f => b'V', 0x11 => b'W', 0x2d => b'X',
                    0x15 => b'Y', 0x2c => b'Z', 0x39 => b' ',
                    _ => b'?',
                };

                if scancode != 0x1c {
                    unsafe {
                        *vga_ptr.offset(cursor * 2) = character;
                        *vga_ptr.offset(cursor * 2 + 1) = 0x0f;
                    }
                    cursor += 1;
                    if count == 0 { c1 = character; count = 1; }
                    else if count == 1 { c2 = character; count = 2; }
                } 
                else {
                    // エンターキー：改行してエコー
                    cursor = ((cursor / 80) + 1) * 80;

                    unsafe {
                        *vga_ptr.offset(cursor * 2) = b'>';
                        *vga_ptr.offset(cursor * 2 + 1) = 0x07;
                        *vga_ptr.offset(cursor * 2 + 2) = c1;
                        *vga_ptr.offset(cursor * 2 + 3) = 0x0a; // 緑
                        *vga_ptr.offset(cursor * 2 + 4) = c2;
                        *vga_ptr.offset(cursor * 2 + 5) = 0x0a;
                    }
                    
                    cursor = ((cursor / 80) + 1) * 80;

                    // 「HI」判定
                    if c1 == b'H' && c2 == b'I' {
                        unsafe {
                            // 1文字ずつ手動で書く！これが一番安全だべ！
                            *vga_ptr.offset(cursor * 2) = b'H';
                            *vga_ptr.offset(cursor * 2 + 2) = b'E';
                            *vga_ptr.offset(cursor * 2 + 4) = b'L';
                            *vga_ptr.offset(cursor * 2 + 6) = b'L';
                            *vga_ptr.offset(cursor * 2 + 8) = b'O';
                            *vga_ptr.offset(cursor * 2 + 10) = b'!';
                            
                            for j in 0..6 {
                                *vga_ptr.offset(cursor * 2 + (j * 2) + 1) = 0x0e; // 黄色
                            }
                        }
                        cursor = ((cursor / 80) + 1) * 80;
                    }

                    count = 0; c1 = 0; c2 = 0;
                }
            }
            last_scancode = scancode;
        }
    }
}

unsafe fn inb(port: u16) -> u8 {
    let result: u8;
    core::arch::asm!("in al, dx", in("dx") port, out("al") result);
    result
}

#[panic_handler]
fn panic(_info: &PanicInfo) -> ! { loop {} }