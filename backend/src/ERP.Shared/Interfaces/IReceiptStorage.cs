namespace ERP.Shared.Interfaces;

/// <summary>
/// Stores uploaded receipt files. Implementations may target local disk or an
/// object store (e.g. Cloudflare R2).
/// </summary>
public interface IReceiptStorage
{
    /// <summary>
    /// Persists the content and returns its URL — an absolute URL for cloud
    /// storage, or a site-relative path (starting with '/') for local storage.
    /// </summary>
    Task<string> SaveAsync(Stream content, string fileName, string contentType, CancellationToken ct = default);
}
