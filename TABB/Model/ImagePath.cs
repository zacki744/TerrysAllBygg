namespace Models;

/// <summary>Bildsökvägar som sparas på projekt och snickerier: bara uppladdade filer.</summary>
public static class ImagePath
{
    public const string Pattern = @"^/uploads/(?!.*\.\.)[A-Za-z0-9_./-]+$";
    public const string Error = "Ogiltig bildsökväg.";
}
