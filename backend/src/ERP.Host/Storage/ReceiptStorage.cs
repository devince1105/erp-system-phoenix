using Amazon.S3;
using Amazon.S3.Model;
using ERP.Shared.Interfaces;

namespace ERP.Host.Storage;

/// <summary>Saves receipts to wwwroot/uploads/receipts, served as static files.</summary>
public sealed class LocalReceiptStorage : IReceiptStorage
{
    private readonly IWebHostEnvironment _env;

    public LocalReceiptStorage(IWebHostEnvironment env) => _env = env;

    public async Task<string> SaveAsync(Stream content, string fileName, string contentType, CancellationToken ct = default)
    {
        var webRoot = Path.Combine(_env.ContentRootPath, "wwwroot");
        var dir = Path.Combine(webRoot, "uploads", "receipts");
        Directory.CreateDirectory(dir);

        var fullPath = Path.Combine(dir, fileName);
        await using var fs = File.Create(fullPath);
        await content.CopyToAsync(fs, ct);

        return $"/uploads/receipts/{fileName}"; // site-relative; controller makes it absolute
    }
}

/// <summary>Uploads receipts to a Cloudflare R2 (S3-compatible) bucket.</summary>
public sealed class R2ReceiptStorage : IReceiptStorage
{
    private readonly IAmazonS3 _s3;
    private readonly string _bucket;
    private readonly string _publicBaseUrl;

    public R2ReceiptStorage(IAmazonS3 s3, string bucket, string publicBaseUrl)
    {
        _s3 = s3;
        _bucket = bucket;
        _publicBaseUrl = publicBaseUrl.TrimEnd('/');
    }

    public async Task<string> SaveAsync(Stream content, string fileName, string contentType, CancellationToken ct = default)
    {
        var key = $"receipts/{fileName}";
        await _s3.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _bucket,
            Key = key,
            InputStream = content,
            ContentType = contentType,
            DisablePayloadSigning = true, // required by R2's S3 compatibility
        }, ct);

        return $"{_publicBaseUrl}/{key}"; // absolute public URL
    }
}
