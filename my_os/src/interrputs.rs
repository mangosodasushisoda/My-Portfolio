use x86_64::structures::idt::{InterruptDescriptorTable, InterruptStackFrame};

static mut IDT: InterruptDescriptorTable = InterruptDescriptorTable::new();

pub fn init_idt() {
    unsafe {
        IDT.breakpoint.set_handler_fn(breakpoint_handler);
        IDT.load();
    }
}

extern "x86-interrupt" fn breakpoint_handler(
    _stack_frame: InterruptStackFrame)
{
    let vga_ptr = 0xb8000 as *mut u8;
    unsafe {
        *vga_ptr.offset(0) = b'!'; 
        *vga_ptr.offset(1) = 0x4f; 
    }
}