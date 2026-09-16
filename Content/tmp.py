
import os
import fitz  # PyMuPDF


# =========================
# CONFIGURATION
# =========================

PDF_ROOT_FOLDER = r"D:\Drive-Enirb\OtherWork\ChattingTool\Content"
OUTPUT_FOLDER = r"D:\Drive-Enirb\OtherWork\ChattingTool\Content\Content-Fine"

# Rendering quality
DPI = 150


# =========================
# CREATE OUTPUT FOLDER
# =========================

os.makedirs(OUTPUT_FOLDER, exist_ok=True)


# =========================
# FIND ALL PDFs
# =========================

pdf_files = []

for root, dirs, files in os.walk(PDF_ROOT_FOLDER):
    for file in files:
        if file.lower().endswith(".pdf"):
            pdf_files.append(os.path.join(root, file))


print(f"Found {len(pdf_files)} PDF(s).")


# =========================
# RENDER EVERY PAGE
# =========================

total_pages = 0

for pdf_number, pdf_path in enumerate(pdf_files, start=1):

    print(f"\n[{pdf_number}/{len(pdf_files)}]")
    print(f"Processing: {pdf_path}")

    try:
        pdf = fitz.open(pdf_path)

        for page_number, page in enumerate(pdf, start=1):

            # Render the complete page
            # This "flattens" everything into one bitmap
            pixmap = page.get_pixmap(
                dpi=DPI,
                alpha=False
            )

            total_pages += 1

            # Unique filename
            output_filename = (
                f"page_{total_pages:06d}.png"
            )

            output_path = os.path.join(
                OUTPUT_FOLDER,
                output_filename
            )

            # Save as PNG
            pixmap.save(output_path)

            print(
                f"  Page {page_number} -> "
                f"{output_filename}"
            )

        pdf.close()

    except Exception as e:
        print(f"  ERROR: {e}")


# =========================
# DONE
# =========================

print("\n============================")
print("Finished!")
print(f"PDFs found    : {len(pdf_files)}")
print(f"Pages rendered: {total_pages}")
print(f"Output folder : {OUTPUT_FOLDER}")
print("============================")